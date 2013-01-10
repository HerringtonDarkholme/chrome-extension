var Linkedin ={

  name : "linkedin",
  init : function() {  },
  
/*   分析页面并返回数据 */
  parser : function(page) { 

    var data = {'id-type': 'linkedin.com'}

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
    data['id-value'] = /view\?id\=(\d)+/.exec(location.href)[0].split('=')[1]

    function checkAvailability(query,callback){
        if( callback!=undefined && $(query).length!=0) { callback($(query)); return }
        return $(query).length!=0
    }

    //get contact info
    checkAvailability('span.given-name')&&checkAvailability('span.family-name')&&( data['name']=$('span.given-name').text()+' '+$('span.family-name').text() )

    if(checkAvailability('table[summary|="Contact Info"]')){
        var prefix = 'table[summary|="Contact Info"] '
        checkAvailability(prefix+'th:contains("Email")', function (q) {
            data['e-mail'] = q.next().text()
        })
        checkAvailability(prefix+'th:contains("Phone")',function(q) {
            data['mobile'] = q.next().text().slice(1,-1)
        })
    }

    if(checkAvailability('div.section#profile-personal')){
        //personal infomation available
        var prefix = 'div.section#profile-personal '
        checkAvailability(prefix+'dt:contains("Phone")',function(q) {
            data.hasOwnProperty('mobile')&& (data['mobile'] = q.next().text().slice(1,-1) )
        })
        // gender, e-mail is unavailable by default !
        checkAvailability(prefix+'dt:contains("Birthday")',function(q) {
            data['birth'] = q.next().text().slice(1,-1)
        })
        checkAvailability(prefix+'dt:contains("Marital")',function(q) {
            data['marital'] = q.next().text().slice(1,-1)
        })

    }
    //work experience 
    // set the month to 01 if month information is not available
    checkAvailability('div#profile-experience', function(q){
        data['career']=[]
        var vcard = q.find('.vcard')
        function vcardProcess(query,prop){
            // i is the iterator defined in the loop
            //process all the info in vcard, different 
            var a=$(vcard[i]).find(query)
            if(a.length!=0){

                if(prop=='title'){
                    if(a.text().indexOf(',')!=-1){
                        work[prop]=a.text().split(',')[0]
                        work['department'] = a.text().split(',')[1]
                    }
                    else work[prop] = a.text()
                }

                else if(prop == 'from'||prop == 'to'){

                    if(a.text()=='Present') work[prop]='Present'
                    else if(a[0].title.length>4) {work[prop]=a[0].title.slice(0,7)}
                    else  work[prop] = a[0].title +'-01'
                }

                else work[prop] = a.text()
            }
        }
        for(var i=0; i<vcard.length;i++){
            work ={}
            vcardProcess('a[title]','title')
            vcardProcess('span.org','organization')
            vcardProcess('.dtstart','from')
            vcardProcess('.dtend','to') //two different type
            vcardProcess('.dtstamp','to')
            data['career'].push(work)
        }
    })

    checkAvailability('div#profile-education', function(q){
        data['education']=[]
        var vcard = q.find('.vcard')
        function vcardProcess(query,prop){
            var a=$(vcard[i]).find(query)
            if(a.length!=0){

                if(prop == 'from'|| prop == 'to'){
                    if(a.text()=='Present') school[prop]='Present'
                    else if(a[0].title.length>4) school[prop]=a[0].title.slice(0,7)
                    else school[prop] =a[0].title+'-01'//set default month
                }

                else school[prop] = a.text()
            }
        }
        for(var i=0; i<vcard.length;i++){
            school ={}
            vcardProcess('a[title]','organization')
            vcardProcess('span.degree','degree')
            vcardProcess('span.major a','major')
            vcardProcess('.dtstart','from')
            vcardProcess('.dtend','to')
            vcardProcess('.dtstamp','to')
            data['education'].push(school)
        }
    })

    return data;
  }
  
}