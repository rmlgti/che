module.exports = function() {
  var global = typeof window === 'undefined' ? {} : window;
  global.cheCDN = {
      chunks: [],
      resources: [],
      monaco: {},
      buildScripts: function() {
        this.chunks.map((entry) => this.url(entry.cdn, entry.chunk ))
        .forEach((url)=>{
          var script = document.createElement('script');
          script.src = url;
          script.async = true;
          script.defer = true;
          script.crossOrigin="anonymous";
          script.charset = "utf-8";
          document.head.append(script);
        });
      },
      url: function(onCDN, fallback) {
        var result = fallback;
        if (! global.location.search.match(/^.*\?noCDN(&.+)?$/)) {
          const request = new XMLHttpRequest();
          request.onload = function() {
            if (this.status >= 200 && this.status < 300 || this.status === 304) {
              result = onCDN;
            }
          };
          request.open("HEAD", onCDN, false);
          request.send();
        }
        return result;
      },

      resourceUrl: function(path) {
        var cached = this.resources.find((entry) => entry.resource == path);
        if (cached) {
          return this.url(cached.cdn, cached.resource);
        }
        return path;
      },

      vsLoader: function(context) {
        const loaderURL = this.url(this.monaco.vsLoaderCdn, this.monaco.vsLoader);
        const request = new XMLHttpRequest();
        request.open('GET', loaderURL, false);
        request.send();
        new Function(request.responseText).call(global);
        if (this.monaco.cdnPrefix) {
          vsRequire = context.require;
          const pathsWithCdns = {}
          const pathsWithoutCdns = {}
          pathsWithCdns[this.monaco.mainEditorFile] = this.monaco.cdnPrefix + this.monaco.mainEditorFile;
          pathsWithoutCdns[this.monaco.mainEditorFile] = this.monaco.mainEditorFile;
          const overridePaths = () => vsRequire.config({
            paths: pathsWithCdns
          });
          const restorePaths = () => vsRequire.config({
            paths: pathsWithoutCdns
          });
          context.require = (mods, onload) => {
            if (Array.isArray(mods) && mods[0] && mods[0] == this.monaco.mainEditorFile) {
              overridePaths();
              vsRequire([this.monaco.mainEditorFile],
                  () => {
                    restorePaths();
                    onload();
                  },
                  () => {
                    restorePaths();
                    vsRequire.reset();
                    vsRequire([this.monaco.mainEditorFile], callback);
                  }
              );
            } else {
              vsRequire(mods, onload);
            }
          }
        }
      }
  };

  function cdnLoader(source) {
    if (source.match(/^module\.exports ?\= ?"data:/)) {
      return source;
    }
    const urlContent = source.replace(/^module\.exports ?\= ?([^;]+);$/, '$1');
    return `module.exports = window.cheCDN.resourceUrl(${ urlContent });`;
  }    

  return cdnLoader;
}();
