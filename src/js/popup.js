// TODO: Move operations to background.js 

$.expr[":"].econtains = function(obj, index, meta, stack) {
  return (obj.textContent || obj.innerText || $(obj).text() || "")
      .toLowerCase() == meta[3].toLowerCase();
};

$(document).ready(
    function() {

      var host = 'http://dine.innocodex.com:8011';


      function log(tabid, content) {
        chrome.tabs.sendMessage(tabid, {
          'action' : 'log',
          'content' : content
        });
      }

      function render(target, data) {
        if (target == 'Local') {
          target = $('section.local-data');
        } else {
          target = $('section.remote-data');
          target.find('.-ic-text-button-.goto').unbind('click').click(function(){
            window.open(host+'/profile?action=edit&id='+data._id);
          });
          for ( var index in data['career']) {
            data['career'][index]['from'] = new Date(
                data['career'][index]['from']['date']);
            if (data['career'][index]['to']) {
              data['career'][index]['to'] = new Date(
                  data['career'][index]['to']['date']);
            } else {
              data['career'][index]['to'] = new Date('NaN');
            }
          }
        }

        target.find('h3 span').text(data['name']);
        target.find('p').remove();
        for ( var index in data['career']) {
          work = data['career'][index];
          target.append(('<p><span>' + work['from'].getFullYear() + '-'
              + work['from'].getMonth() + '</span> ~ <span>'
              + work['to'].getFullYear() + '-' + work['to'].getMonth()
              + '</span></p><p><strong>' + work['organization'] + '</strong></p>')
              .replace('NaN-NaN', '至今'));
        }
      }

      var ldata = undefined;

      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          action : 'getHtml'
        }, function(response) {

          var html, resume_format;

          html = $(response.html);

          for ( var index in inno['resume-formats']) {
            resume_format = inno['resume-formats'][index];
            if (resume_format.assert(html)) {
              ldata = resume_format.parse(html);
              render('Local', ldata);
              break;
            }
          }

          if (ldata == undefined)
            return;

          $.getJSON(host + '/profile/getbyid.api', {
            'request' : JSON.stringify({
              'id-type' : 'zhaopin.com',
              'id-value' : ldata['id-value'],
            })
          }, function(response) {
            if (response.data == undefined) {
              ;
            } else {
              render('Remote', response.data);
            }
          });
        });
      });

      $('.-ic-text-button-.update-profile').click(function() {
        $.getJSON(host + '/profile/update.api', {
          'request' : JSON.stringify({
            'id-type' : 'zhaopin.com',
            'id-value' : ldata['id-value'],
            'data' : ldata,
          })
        }, function(response) {
          if (response.data == undefined) {
            ;
          } else {
            render('Remote', response.data);
          }
        });
      });

    });
