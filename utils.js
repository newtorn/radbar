exports.time = {
    time: Date.now(),
    sleep: (d) => { for(var t = Date.now();Date.now() - t <= d;); },
    format: (sec) => {
        sec = Math.max(sec, 0);
        let s = Math.floor(sec % 60).toFixed(0);
        let m = Math.floor((sec / 60) % 60).toFixed(0);
        let h = Math.floor((sec / 3600) % 60).toFixed(0);
        let r = m.padStart(2, '0') + ':' + s.padStart(2, '0');
        r = h > 0 ? h.padStart(2, '0') + ':' + r : r;
        return r;
    },
}
