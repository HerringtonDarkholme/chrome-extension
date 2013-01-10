var inno = inno || {};

// 
inno['resume-formats'] = inno['resume-formats'] || new Array();

inno['resume-formats'].push({
  'assert' : function() {
    return $('.resume-preview') != null;
  },
  'parse' : function(html) {

    data = {};
    var id_patt = /ID:(.*)$/g;

    data['id-type'] = 'zhaopin.com';
    data['id-value'] = id_patt.exec(html.find('.resume-left-tips-id').html())[1];

    data['name'] = html.find('.main-title-fl').html();
    
    if (data['name'] == '个人信息') {
      data['name'] = 'unknown@zhaopin.com';
    }
    
    mobile = /手机 ：(.*)$/.exec(html.find('.resume-preview-main-title .main-title-fr').text());
    if (mobile) {
      data['mobile'] = mobile[1];
    }
    
    data['e-mail'] = html.find('.summary-bottom a').text();

    var workexp = html.find('h3:contains("工作经历")').parent(); //not econtains
    
    data['career'] = new Array();

    workexp.children().each(function(index) {
      if ($(this).prop('tagName') == 'H2') {
        var splited_0 = $(this).text().replace(/\xA0/g, ' ').split(' ');
        splited_1 = $(this).next().text().replace(/\xA0/g, ' ').split(' ');
        var department = '', title = '';
        for (var index in splited_1) {
          if (/\|/.exec(splited_1[index]) != null) {
            continue;
          }
          if (/(总监|经理|主任|员|师|长|主管)$/.exec(splited_1[index]) != null) {
            title = splited_1[index];
          }
          if (/(部|部门)$/.exec(splited_1[index]) != null) {
            department = splited_1[index];
          }
          if (/^(.*)元\/月/.exec(splited_1[index]) != null) {
            continue;
          }
        }
        data['career'].push({
          'organization' : splited_0[4],
          'from' : new Date(Date.parse(splited_0[0])),
          'to' : new Date(Date.parse(splited_0[2])),
          'department' : department,
          'title' : title,
        });
        console.log(data);
      }
    });

    return data;
  }
});