(function() {

  "use strict" ;

    function renderJSON(json) {
        function renderJSONApiObject(data, aggregate) {
            const attributes = data.attributes || {};

            const attrs = attributes && Object.keys(attributes).map(key => {
                if (key === 'embedded' ||
                    key === 'display-name') {
                        return;
                }

                return `<div><span style="color:blue;">${key}:</span> ${JSON.stringify(attributes[key])}</div>`
            }) || [];

            const rels = data.relationships && Object.keys(data.relationships).map(key => {
                if (key === 'embedded') return;

                return `<div><a style="color:lightcoral;" href="${relUrl(data.relationships[key])}">${key}:</a> ${renderRel(data.relationships[key], key, aggregate)}</div>`
            }) || [];

            return `<div style="margin-left: 2em;">name: <b><span style="font-size:medium;" title="${data.id}">${attributes['display-name']}</span></b>${attrs.join('\n')}${rels.join('\n')}</div>`;
        }

        function relUrl(rel) {
            if (!rel.links) return;

            return rel.links['related-representation-full'] && rel.links['related-representation-full'].href || rel.links['related'];
        }

        function renderRel(rel, key, data) {
            if (rel.data) {
                const storage = data.attributes.embedded;

                if (Array.isArray(rel.data)) {
                    return '[<br>\n' + rel.data.map(d => {
                       const emb = storage.find(i => i.links.self === d.self)
                       if (!emb) {
                           return 'not found: ' + d.self;
                       }
                       return renderJSONApiObject(emb, data);
                    }).join('---\n') + ']<br>\n';
               }

               if (rel.data.self) {
                   const emb = storage.find(i => i.links.self === rel.data.self)
                   if (!emb) {
                       return 'not found: ' + rel.data.self;
                   }
                   return renderJSONApiObject(emb, data);
               }
            }

            if (rel.links) {
                const href = relUrl(rel);
                if (href) {
                    return `<em title="${href}" onclick="fetchAndExpand(arguments[0], this.getAttribute('title'), this.nextSibling);"> + </em><div></div>\n`;
                }
                return JSON.stringify(rel.links);
            }
            return JSON.stringify(rel);

        }

        const data = json.data || json;

        if (Array.isArray(data)) {
          return '[<br>\n' +
                 data.map(d => renderJSONApiObject(d, d)).join('===<br>') +
                 ']<br>\n';
        }
        return renderJSONApiObject(data, data);
    }

    function fetchAndExpand(e, url, div) {
        e.stopPropagation();

        fetch(url).then(response => {
            response.json().then(data => {
                div.innerHTML = renderJSON(data);
            })
        })
    }

    setTimeout(function () {
      var script = document.createElement("script") ;
      script.innerHTML =
        'window.fetchAndExpand = ' + fetchAndExpand.toString() + ';' +
        'window.renderJSON = ' + renderJSON.toString() + ';'
      document.head.appendChild(script);
    }, 10) ;

})();

