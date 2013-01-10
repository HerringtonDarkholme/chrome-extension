var ZhaoPin ={

  name : "zhao_pin",
  init : function() {  },
  
/*   分析页面并返回数据 */
  parser : function(page) { 

    data = {'id-type': 'zhaopin.com'}

/*    data={  //initialize
    	id-type: 'zhaopin.com',
    	id-value : "",
    	name : "",
    	mobile : "",
    	e-mail : "",
      gender : "",
      birth : new Date(1900,1,1),
      marital : "",//male or female
    	career : [],
      education : []
    }
    */
    if($('.resume-left-tips-id').length!=0) data['id-value'] = $($('.resume-left-tips-id')[0]).text().split(':')[1]
    if($('#userName').length!=0)  data['name'] = $('#userName').text()
    
    console.log('name ok')

    var info = $('.summary-top').text()
    data['gender'] = /男|女/.exec(info)[0]=='男'?'male':'female'
    var y = /\d{4}/.exec(info)[0], //assume nobody will live or work longer than 1000 
        m = parseInt( /\d+月/.exec(info)[0].slice(0,-1) ) -1
    data['birth'] = new Date(y,m)
    data['marital'] = /(已婚)|(未婚)|(保密)/.exec(info)[0]=='已婚'?'married':(/(已婚)|(未婚)|(保密)/.exec(info)[0]=='未婚'?'unmarried':'secret')

    console.log('info ok')

    var contact =  $('.summary-bottom').text(),
    mobile= /手机：\d*/.exec(contact)
    mail = /E-mail：.*/.exec(contact)
    if(mobile!=null) data['mobile']=mobile[0].split('：')[1]
    if(mail!=null) data['e-mail'] = mail[0].split('：')[1]

console.log('contact ok')

    if( $("h3:contains('工作经历')").length !=0) {
      var workexp = $("h3:contains('工作经历')").parent().find('h2')
      data['career'] = []
      for(var i=0; i<workexp.length;i++){
        var work= {}, dateAndOrg = $(workexp[i]).text().split(/\s\s/), deptAndTitle = $(workexp[i]).next().text().split('|')
        work['organization'] = dateAndOrg[1]
        work['from'] = new Date(dateAndOrg[0].split(/\s/)[0])
        work['to'] = dateAndOrg[0].split(/\s/)[2] =='至今' ? new Date('NaN') : new Date(dateAndOrg[0].split(/\s/)[2])
        if (deptAndTitle.length == 3){
            work['department'] = deptAndTitle[0]
            work['title'] = deptAndTitle[1]
        }
        else {work['title'] = deptAndTitle[0]}
        data['career'].push(work)
      }
    }

console.log('work ok')

    if( $("h3:contains('教育经历')").length!=0){
        var edu = $('h3:contains("教育经历")').next().text().replace(/(\s*)$/,'').replace(/\n/,'').split(/\n/) //truncate trivial things
        data['education'] = []
        for (var i =0; i<edu.length;i++){
            var school ={}, t=edu[i].split(/\s\s/), date = t.splice(0,1)[0].split(/\s/)
            school['from'] = new Date(date[0])
            school['to'] = date[2] == '至今' ? new Date('NaN') : new Date(date[2])
            school['organization'] = t.splice(0,1)[0]
            school['degree'] = t.splice(-1)[0]
            school['major'] = t.join(' ')
            data['education'].push(school)
        }
    }

console.log('school ok')
    return data;
  }
  
}