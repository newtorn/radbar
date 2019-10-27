const stringWidth = require('string-width');

const MOVE_LEFT = Buffer.from('1b5b3130303044', 'hex').toString();
const MOVE_UP = Buffer.from('1b5b3141', 'hex').toString();
const CLEAR_LINE = Buffer.from('1b5b304b', 'hex').toString();

/**
 * format time with serconds
 * if time less than 60 minutes then format with 00:00
 * else then format with 00:00:00
 *
 * @param {*} sec
 * @returns
 */
function timeFormat(sec){
    sec = Math.max(sec, 0);
    let s = Math.floor(sec % 60).toFixed(0);
    let m = Math.floor((sec / 60) % 60).toFixed(0);
    let h = Math.floor((sec / 3600) % 60).toFixed(0);
    let r = m.padStart(2, '0') + ':' + s.padStart(2, '0');
    r = h > 0 ? h.padStart(2, '0') + ':' + r : r;
    return r;
}

/**
 * Make stream to write on the same line
 * @param {NodeJs.WriteStream} stream 
 */
function wrapStream(stream) {
    let str;
    let write = stream.write;
    stream.write = function (data) {
        if (str && data !== str) str = null;
        return write.apply(this, arguments);
    };
    if (stream === process.stderr || stream === process.stdout) {
        process.on('exit', function () {
            if (str !== null) stream.write('');
        });
    }
    let prevLineCount = 0;
    let log = function () {
        str = '';
        let nextStr = Array.prototype.join.call(arguments, ' ');

        // Clear screen
        for (let i = 0; i < prevLineCount; i++) {
            str += MOVE_LEFT + CLEAR_LINE + (i < prevLineCount - 1 ? MOVE_UP : '');
        }

        // Actual log output
        str += nextStr;
        stream.write(str);

        // How many lines to remove on next clear screen
        let prevLines = nextStr.split('\n');
        prevLineCount = 0;
        for (let i = 0; i < prevLines.length; i++) {
            prevLineCount += Math.ceil(stringWidth(prevLines[i]) / stream.columns) || 1;
        }
    };

    log.clear = function () {
        stream.write('');
    };

    return log;
}

/**
 * Write on the same line
 * @filed {Stream} linestout
 * @filed {Stream} linestderr
 * @api public
 */
class WriteOneLine {
    /**
     * 
     * @param {NodeJs.WriteStream} stream 
     */
    constructor(stream) {
        if (stream === 'stderr') {
            stream = process.stderr;
        } else if (stream === 'stdout' || stream !== process.stdout || stream !== process.stderr) {
            stream = process.stdout;
        }
        this._writerfunc = wrapStream(stream);
    }
    /**
     * 
     * @param  {...any} args 
     */
    log(...args) {
        this._writerfunc(...args);
    }
}

/** @api public */
exports.ProgressBarOptions = class ProgressBarOptions { total; unit; desc; dest; barlen; visrest; endl; comp_char; rest_char; callback; }

exports.ProgressBar = class ProgressBar {
    /**
     * 
     * @param {ProgressBarOptions} options 
     */
    constructor(options = {}) {
        // public instance fields
        this.total = options.total ? options.total : 100;
        this.unit = options.unit ? options.unit : 'Bytes';
        this.desc = options.desc ? options.desc + ': ' : '';
        this.barlen = options.barlen ? options.barlen : process.stdout.columns;
        this.visrest = options.visrest;
        this.endl = options.endl;
        this.comp_char = options.comp_char ? options.comp_char : '\u2588'; // \u2588 █
        this.rest_char = options.rest_char ? options.rest_char : '\u2591'; // \u2591 ░
        this.callback = options.callback;

        // private fields
        this._ended = false;
        this._comp_num = 0;
        this._preratio = 0;
        this._sec_num = 0;
        this._restime = 0;
        this._usetime = 0;
        this._pretime = Date.now() / 1000;
        this._writer = new WriteOneLine(options.dest);
    }

    /**
     * 
     * @param {number} cur_num represents the length of current readed data
     */
    update(cur_num = 0) {
        cur_num = Math.min(cur_num, this.total - this._comp_num);

        if (this._ended) { return; }

        this._comp_num += cur_num;
        let precent = (this._comp_num / this.total).toFixed(4);

        let _cur_time = Date.now() / 1000;
        let use_time = _cur_time - this._pretime;
        if (use_time >= 1) {
            this._usetime += use_time;
            let cur_ratio = this._sec_num / use_time;
            if (cur_ratio) {
                this._restime = (this.total - this._comp_num) / cur_ratio;
            }
            else if (this._preratio) {
                this._restime = (this.total - this._comp_num) / this._preratio;
            } else {
                this._restime += use_time;
            }
            this._sec_num = 0;
            this._preratio = cur_ratio;
        } else if (use_time) {
            this._usetime += use_time;
            this._preratio = cur_num / use_time;
            this._restime = (this.total - this._comp_num) / this._preratio;
        }
        this._pretime = _cur_time;
        this._sec_num += cur_num;

        //bar_left
        let bar_left = this.desc;
        let prec = (100 * precent).toFixed(2).split('.');
        bar_left += prec[0].padStart(3, ' ') + '.' + prec[1] + '%|';

        //bar_right
        let bar_right = '| ' + this._comp_num + '/';
        bar_right += this.visrest ? (this.total - this._comp_num) + '/' : '';
        bar_right += this.total + ' [';
        bar_right += timeFormat(this._usetime) + '>';
        bar_right += timeFormat(this._restime) + ', ';
        bar_right += this._preratio.toFixed(2) + this.unit + '/s]';

        let unbar_len = bar_left.length + bar_right.length;
        let bar_len = Math.max(process.stdout.columns - unbar_len, 0);
        if (bar_len >= this.barlen) {
            if (0 < this.barlen && this.barlen < bar_len) {
                bar_len = this.barlen;
            } else {
                bar_len = 0;
            }
        }

        //bar_center
        let bar_center = '';
        let comp_num = Math.floor(bar_len * precent);
        let rest_num = bar_len - comp_num;
        bar_center += ''.padStart(comp_num, this.comp_char);
        bar_center += ''.padStart(rest_num, this.rest_char);

        this._writer.log(bar_left + bar_center + bar_right);

        if (this._comp_num >= this.total) {
            this._ended = true;
            if (this._ended) {
                console.log();
            }
        }

        if (typeof this.callback === 'function') {
            this.callback(this.total, this._comp_num, this._preratio, this._restime, this._sec_num);
        }
    }

    /**
     * 
     * @param {Iterable|string|number} obj if it's number then will as options total, else use obj.length as total
     * @param {ProgressBarOptions} options
     * @returns {Generator}
     */
    static *iterator(obj, options = {}) {
        let bar;
        if (typeof obj === 'number') {
            options.total = obj;
            bar = new ProgressBar(options);
            bar.length = obj;
            for (let v = 0; v < obj; ++v) {
                bar.update(1);
                yield v;
            }
        } else if (typeof obj === 'string') {
            options.total = obj.length;
            bar = new ProgressBar(options);
            bar.length = obj;
            for (let v = 0; v < obj.length; ++v) {
                bar.update(1);
                yield obj[v];
            }
        } else if (typeof obj === 'object') {
            options.total = obj.length;
            bar = new ProgressBar(options);
            for (let v of obj) {
                bar.update(1);
                yield v;
            }
        }
    }
}