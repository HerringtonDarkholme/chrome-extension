

/**
 * 在符合条件的网站和页面右边栏上增加新的按钮
 */
  var api_response
  var host ='http://dine.innocodex.com:8011'
  var current_selected_id;  //当前选择的简历的id值
 
$(document).ready(function() { 

  console.log("content script init");
  var $compareBtn = $("<div id='compareIcon' class='cssCompareBtn'><div></div></div>"); //add an inner element here
  var $compareView = $("<div id='compareView' class='cssCompareView'><section id='remoteData' class='cssSection'><hgroup class='cssHGroup'><span id='remoteTtile' class='cssTitle'>Innocodex -</span><span id='remoteClientName' class='cssTitle'>&nbsp;</span><span class='cssTitleBtn'>查看</span></hgroup></section><section id='localData' class='cssSection'><hgroup class='cssHGroup'><span id='localTitle' class='cssTitle'>智联招聘 - </span><span id='localClientName' class='cssTitle'>&nbsp;</span><span class='cssTitleBtn'>更新</span></hgroup></section><section id='remoteResume' class='cssSection'>&nbsp;</section><section id='localResume' class='cssSection'></section></div>");

  $('body').append($compareBtn);
  $('body').append($compareView);
  
  //load resume and remote data init compareView
  //这个是不是没用了？要不要删掉？
  function update(){
    request={
      'id-type': localResume['id-type'],
      'id-value': localResume['id-value'],
      'data' : localResume
    }
    if (current_selected_id != undefined){
      request['oid'] = current_selected_id;
    }
    $.ajax({
      url: host + '/profile/update.api',
      data: { 'request':JSON.stringify(request) },
      dataType: 'json',
      type: 'post',
      success: function(resp){
        if(resp.data==undefined) return;
        else {
        
          render('remote',$('#remoteResume'),resp.data)
          //console.log("remote data= "+allPrpos(resp));
          $('span:contains("更新")').unbind('click')
          $('span:contains("查看")').bind('click',function(){window.open(host+'/profile?action=edit&id='+resp.data._id)})
        }
      },
      error: function() {$('#remoteResume').text('Something went wrong...(´・ω・｀)')}

    }) 
  }

  
/*   监测当前页面是否可以分析出简历 */
  if(checkSite()){
    var localResume = siteParser.parser();
    render('local',$('#localResume'),localResume);
    
  /* for test remote display style
    //for one resume in remote
    render('remote',$("#remoteResume"),localResume); 
        */
    //for some resume in remote
    var resumeList=new Array();
    resumeList.push(localResume);
    resumeList.push(localResume);
    //render('remote',$('#localResume'),resumeList);


    $('span:contains("更新")').bind('click',update)
    //code here
  
    /* XHR调用，确认服务器是否已同步过信息，后改变按钮$compareBtn颜色 */
    
    
 
    $.ajax({
      url: host +'/profile/search.api',
      data: {
      'request':JSON.stringify({
        'id-type': localResume['id-type'],
        'id-value':localResume['id-value'],
        'data' : localResume
      })},
      dataType: 'json',
      type: 'post',
      success: function(resp){
/*         alert('success!') */
        if(resp.suggestion==undefined /*&& resp.syncStatus ==undefined*/){
            $compareBtn.children().addClass("cssBtnRed");
        }else {
            $compareBtn.children().addClass('cssBtnGreen');
            //console.log("remote call return msg: "+allPrpos(resp));
            render('remote',$('#remoteResume'),resp.suggestion) 
        }
      },
      error: function() {$compareBtn.children().addClass("cssBtnGray")}

    }) 


    
    
    /*     判断当前对比页面compareView显示状态，控制打开和关闭 */
    $compareBtn.toggle(function(){
         //alert("显示信息对比页面"); 
      
      $compareView.show();

    },function(){
           //alert("隐藏信息对比页面") 
      
      $compareView.hide();
      
    });
   }
});


/* load resume and remote data init compareView */
function render(type,target,data){
  //show the infomation in the div, please refer to the declaration of $localSect and $remoteSect for the html structure
  // [string] type : local|remote
  // [jQuery Object] : the element to be modified
  // data : resume dictionary. remote data and local data should be processed differently
  if(type == 'remote'){
    //console.log("render remote data to div");
    var isArray = Object.prototype.toString.apply(data) === '[object Array]';
    if(isArray){
    /* for get muitle resume from remote server
     * 当返回多条数据时，在remote区只显示简历的基本信息，当mouse over时能展开，并可选定以便更新
     */
      console.log("remote data is array");
      var remoteResume = $("#remoteResume")
      for(var i=0; i<data.length; i++){
        var ele = data[i];

        var gender=ele['gender']=='male'?'男':'女';
        var marital=ele['marital']=='married'?'已婚':'未婚';
          var teststr= "<div class='cssMuliteResumeBox' id='"+ ele._id +"'><p class='black_big'>"+ ele['name'] +" "+ gender + " " + ele['birth'].split('-')[0] + " " + marital +"</p>";
          
          // add work exp data
          if(ele.hasOwnProperty('career')){
            teststr +=("<p class='black'>工作经历</p>");
            //Caveat! Do not use the same iterator in a loop that is inside a loop that uses the same iterator!!
            for ( var j=0; j<ele['career'].length; j++) {
              work = ele['career'][j];
              //console.log("career = " + allPrpos(work));          
              //for Remote render
              teststr += (('<p>' + work['from'] + ' ~ '
                  + work['to'] + "</p>").replace('undefined', '至今'));
              teststr += ("<p><span class='black'>" + work['organization'] + "</span><span class='black'>" 
                + work['title'] + "</span></p>");
            }
          }
          if(ele.hasOwnProperty('education')){
            teststr += ("<p class='black'>教育经历</p>")
            for ( var j=0; j<ele['education'].length; j++) {
                  var school = ele['education'][j];
                  if(typeof school == 'object' && school != null){
                     school['from'] = school['from']['date'].split('-');
                    if ( school.hasOwnProperty('to') ){
                      school['to'] = school.to.date.split('-');
                    }else{school['to']=['NaN','NaN']}
                    teststr += ('<p>' + school['from'][0]+'-'+school['from'][1]+ ' ~ '
                        + school['to'][0]+'-'+school['to'][1]
                        + "</p>").replace('NaN-NaN', '至今');
                    teststr += ("<p><span class='black'>" + school['organization'] + "</span><span class='black'>" + school['degree'] + "</span></p>");
                  }
            }
          }
          
          remoteResume.append(teststr);
    
        }
        remoteResume.append("<div class='cssMuliteResumeBox' id='undefined'><p class='black_big'>新建档案</p>");
      $('.cssMuliteResumeBox').click(function(e) { 
        var self = $(this);
        console.log("select a resume "+ $(this).attr('id'));
        if (self.hasClass('cssMuliteResumeBoxSelected')){
          self.removeClass('cssMuliteResumeBoxSelected');
          current_selected_id = undefined;
        }
        else{
          $('.cssMuliteResumeBox').removeClass('cssMuliteResumeBoxSelected');
          current_selected_id = self.attr('id')!='undefined'?self.attr('id'):undefined;
          self.addClass("cssMuliteResumeBoxSelected");
        }
        
        
        
       });
      
    }else{    //for only one resume from remote server
      //if onle one resume from remote. format=local formate 
      console.log("remote data is only one");
      api_response = data
      current_selected_id = data._id;   //唯一结果，自动选定
      $("#remoteClientName").text(data['name']);
      var gender=data['gender']=='male'?'男':'女';
      var marital=data['marital']=='married'?'已婚':'未婚';
      target.html($("<div id='localBasicProfile'><p class='cssResumeNameText'>"
        + gender +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+data['birth']['date'].toString().split('-')[0]
        +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+marital+'</p></div>'));
      if(data.hasOwnProperty('career')){
        target.append("<div id='localWorkExp'><h2>工作经历</h2></div>");
        
        for ( var i=0; i<data['career'].length; i++) {
            work = data['career'][i];
            //for Remote render!
            if(typeof work == 'object' && work != null){    
              work['from'] = work.from.date.toString().split('-')
              if (work.hasOwnProperty('to')){
                work['to'] = work.to.date.toString().split('-')||['NaN','NaN']
              }else{work['to']=['NaN','NaN']}
              $('#localWorkExp').append(('<p><span>' + work['from'][0] + '-'
                  + work['from'][1] + '</span> ~ <span>'
                  + work['to'][0]+ '-' + work['to'][1]
                  + "</span></p><p style='color:black;'><strong>" + work['organization'] + '</strong></p>')
                  .replace('NaN-NaN', '至今'));
            }
        } 
      }
    
    if(data.hasOwnProperty('education')){
      target.append("<div id='localEduExp'><h2>教育经历</h2></div>")
      for ( var i=0; i<data['education'].length; i++) {
            school = data['education'][i];
            if(typeof school == 'object' && school != null){              
              school['from'] = school.from.date.toString().split('-')
              if (school.hasOwnProperty('to')){
                school['to'] = school.to.date.toString().split('-')||['NaN','NaN']
              }else{
                school['to']=['NaN','NaN']
              }
              $('#localEduExp').append(('<p><span>' + school['from'][0] + '-'
                  + school['from'][1] + '</span> ~ <span>'
                  + school['to'][0] + '-' + school['to'][1]
                  + "</span></p><p style='color:black;'><strong>" + school['organization'] + '</strong></p>')
                  .replace('NaN-NaN', '至今'));
            }
      }
    }
    
  }
  
}else{
      
    // 客户名移到上面去了
    $('#localClientName').text(data['name']);
    /*       target.append('<h2>'+data['name']+'</h2>') */
    
    /*
     *  格式重新整理一下
     *              <section>
     *               <div id="localBasicProfile"><h2>男   已婚</h2></div>
     *               <div id='localWorkExp'><h2 class=''>工作经历</h2><p>xxxx ~ xxx</p></div>
     *               <div id="localEduExp"></div>
     *              </section>
     */
    var gender=data['gender']=='male'?'男':'女';
    var marital=data['marital']=='married'?'已婚':'未婚';
    target.append($("<div id='localBasicProfile'><p style='text-align: center; color:black; font-weight:bold; font-size:17px;'>"+ gender +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+data['birth'].getFullYear()+'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+marital+'</p></div>'));
    if(data.hasOwnProperty('career')){
      target.append("<div id='localWorkExp'><h2>工作经历</h2></div>");
      
      for ( var i=0; i<data['career'].length; i++) {
          work = data['career'][i];
          if(typeof work == 'object' && work != null) {          
            $('#localWorkExp').append(('<p><span>' + work['from'].getFullYear() + '-'
                + work['from'].getMonth() + '</span> ~ <span>'
                + work['to'].getFullYear() + '-' + work['to'].getMonth()
                + "</span></p><p style='color:black;'><strong>" + work['organization'] + '</strong></p>'
                +'<p style="color:black;">' +work['title']+'</p>')
                .replace('NaN-NaN', '至今'));
          }
      }
      
    }
    
    if(data.hasOwnProperty('education')){
      target.append("<div id='localEduExp'><h2>教育经历</h2></div>")
      for ( var i=0; i<data['education'].length; i++) {
            school = data['education'][i];
            if(typeof school == 'object' && school != null) {              
              $('#localEduExp').append(('<p><span>' + school['from'].getFullYear() + '-'
                  + school['from'].getMonth() + '</span> ~ <span>'
                  + school['to'].getFullYear() + '-' + school['to'].getMonth()
                  + "</span></p><p style='color:black;'><strong>" + school['organization'] + '</strong></p>'
                  +'<p style="color:black;">' +school['degree'] +'</p>')
                  .replace('NaN-NaN', '至今'));
            }
      }
    }
  }

}


   

/**
 * 找到 js/resume-format/xxx 下的各个类，判断是那个网站，调用不同的抓取类来实现抓取
 */
var siteParser = null;
function checkSite() { 
 
 //检测是那个网站... 

 var site = location.href;
 
  if(site.search(/zhaopin/)!=-1){
    siteParser = Object.create(ZhaoPin);
    return true;
  }

/*
  if(site.search(/51job/)!=-1){
    siteParser = Object.create(51job);
    return true;
  }
  if(site.search(/linkedin/)!=-1){
    siteParser = Object.create(Linked);
    return true;
  }
  */
  
  //for test zhao pin site local file
  return siteParser = Object.create(ZhaoPin);
  
  //return false;
}

/**
 * for test display all object value
 */
function allPrpos(obj) { 
     // 用来保存所有的属性名称和值
     
     var props = "";
     
     // 开始遍历
     for(var p in obj){ 
         // 方法
         if(typeof(obj[p])=="function"){ 
             obj[p]();
         }else{ 
             // p 为属性名称，obj[p]为对应属性的值
             props+= p + "=" + obj[p] + "\t";
         } 
     } 
     // 最后显示所有的属性
     return props;
 }