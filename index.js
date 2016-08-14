$(function () {
  var baseUrl = "https://github.com/";
  insertNavItem("Trending", "https://github.com/trending");
  insertNavItem("Stars", "https://github.com/stars");
  Promise.all([getSelfActivity(), getOthersActivity()]).then(mergeActivity).catch(function(error) {
    console.log(error);
  });

// add nav item in github home page
  function insertNavItem(name, link) {
    var nav = $('ul.header-nav.left');
    var item = $("<li class='header-nav-item'/>").append("<a class='header-nav-link' href='" + link + "'>" + name + "</a>" );
    nav.append(item);
  }

// merge with person activities in github home page
  function mergeActivity(activityArr) {
    if (activityArr.length !== 2) {
      console.log("Error occurred when run mergeActivity, invalid parameter");
      return;
    }
    var selfActivity = activityArr[0];
    var othersActivity = activityArr[1];
    var index = 0;
    othersActivity.forEach(function (item) {
      while (index < selfActivity.length && selfActivity[index].time > item.time) {
        item.element.before(selfActivity[index].html);
        index = index + 1;
      }
    });
  }

  function getOthersActivity() {
    return new Promise(function (resolve, reject) {
      var activities = [];
      $(".alert").each(function () {
        var item = {};
        var el = $(this);
        var el_time = el.find(".body>.time>relative-time").attr('datetime') ||
          el.find(".body>.simple>.time>relative-time").attr('datetime');
        item.time = el_time;
        item.element = el;
        activities.push(item);
      });
      resolve(activities);
    });
  }

  function getSelfActivity() {
    var selfAtomUrl = baseUrl + $("meta[name='user-login']").attr('content') + ".atom";
    return new Promise(function (resolve, reject) {
      getSelfAtom(selfAtomUrl)
      .then(function (xml) {
        var selfActivity = transformXML(xml);
        resolve(selfActivity);
      })
      .catch(reject)
    });
  }

  function getSelfAtom(url) {
    return new Promise(function (resolve, reject) {
      $.get(url, function (data) {
        resolve(data);
      }).fail(reject);
    });
  }

  function transformXML(xml) {
    var entryList = [];
    $(xml).find("entry").each(function () {
      var item = {};
      var content = $("<div/>").html($(this).find("content")).text();
      item.html = $("<div class='alert'/>").append($("<div class='body'/>").append(content))[0].outerHTML;
      item.time = $(this).find("updated").text();
      entryList.push(item);
    });
    return entryList;
  }
});

