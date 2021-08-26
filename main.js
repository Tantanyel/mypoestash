var dateYear = new Date();
dateYear.setFullYear(dateYear.getFullYear() + 1);


var profile;
var leagueSelect;
var leagueArray = [];
var tabsObj;
var objectitems = {};


$(document).ready(function () {
   if (getCookie('MyToken')) {
      getProfile();
   }

   $("body").on("click", ".tabsbtn", chTab);

   $("body").on("mouseover", ".item", function (e) {
      let iditem = $(e.currentTarget).attr("data-id");
      let htmlhov = objectitems[iditem].htmlHover;
      $("body").append(htmlhov);
      $(".itemhover").addClass("visible");
      let hcorect = ($(window).height() - $(e.currentTarget).offset().top) - ($(".itemhover").outerHeight() + 16);
      if (hcorect > 0) {
         hcorect = 0;
      }
      $(".itemhover").css({
         "top": $(e.currentTarget).offset().top + hcorect,
         "left": $(e.currentTarget).offset().left + $(e.currentTarget).width() + 16,
      });
   });
   $("body").on("mouseout", ".item", function (e) {
      $(".itemhover").remove();
   });

   $("body").on("click", ".item", function (e) {
      let iditem = $(e.currentTarget).attr("data-id");
      if (objectitems[iditem].isChecked && !objectitems[iditem].price) {
         priceCh(null, "one", iditem);
         $(".itemhover").remove();
      } else {
         info("You can't check this item", 1000);
      }
   });

   $("body").on("mouseover", ".itemPrice", function (e) {
      let iditem = $(e.currentTarget).attr("data-id");
      $(".items .item").removeClass("hover").addClass("hiden");
      $(".items .item[data-id=" + iditem + "]").removeClass("hiden").addClass("hover");
   });
   $("body").on("mouseout", ".itemPrice", function (e) {
      $(".items .item").removeClass("hiden");
      $(".items .item").removeClass("hover");
   });

   $("body").on("click", ".priceCheck", priceCh);

});

function getProfile() {
   $.ajax({
      url: "/data.php?profile=1",
      method: "GET",
      success: function (data) {
         let req = JSON.parse(data);
         profile = req.name;
         getLeague();
      },
      error: function (e) {
         $(".content .loading").remove();
         $(".content").append(`<span class="autherr h4"><b>Error</b></span>`);
      }
   });
}

function getLeague() {
   $.ajax({
      url: "/data.php?league=1",
      method: "GET",
      success: function (data) {
         let req = JSON.parse(data);
         for (var i in req) {
            leagueArray.push(req[i].name);
         }
         var saveLeague = getCookie('league');
         if (saveLeague && leagueArray.indexOf(saveLeague) != -1) {
            leagueSelect = saveLeague;
         } else {
            leagueSelect = leagueArray[0];
            setCookie('league', leagueSelect, {
               expires: dateYear
            });
         }
         darwAll();
      }
   });
}

function darwAll() {
   $(".content .loading").remove();

   let leaguehtml = "";
   for (var i in leagueArray) {
      let sel = false;
      if (leagueArray[i] == leagueSelect) {
         sel = true;
      }
      leaguehtml += `<option value="${leagueArray[i]}" ${sel ? "selected" : ""}>${leagueArray[i]}</option>`;
   }

   let html = `
   <div class="maincontent">
     <div class="stash">
       <div class="tabs"></div>
       <div class="griditem">
         <div class="loading">
           <div class="spinner-border"></div>
         </div>
       </div>
     </div>
     <div class="prices">
       <div class="toppanel">
           <select class="form-select leagueSelect" onchange="chLeague(this)">
             ${leaguehtml}
           </select>
           <div class="input-group chAllPrice">
             <input id="minPrice" type="text" class="form-control" value="1">
             <span>from</span>
             <i class="chaos"></i>
             <button class="btn btn-primary priceCheck" type="button">Сheck</button>
           </div>
       </div>
       <div class="itemsprices customScroll"></div>
     </div>
   </div>`;

   $(".content").append(html);

   let tab = getCookie('tabid');
   if (tab) {
      getStash(tab);
   } else {
      getStash();
   }
}

function chLeague(obj) {
   let select = $(obj);
   if (leagueSelect != select.val()) {
      leagueSelect = select.val();
      setCookie('league', leagueSelect, {
         expires: dateYear
      });
      tabsObj = undefined;
      getStash();
   }
}

function getStash(id = 0) {

   $(".griditem").empty();
   $(".griditem").append(`<div class="loading"><div class="spinner-border"></div></div>`);

   if (tabsObj) {
      if (tabsObj[id] && id != 0) {
         getTab(tabsObj[id].id);
      } else {
         let keys = Object.keys(tabsObj);
         getTab(tabsObj[keys[0]].id);
      }
   } else {
      $.ajax({
         url: "/data.php?tabs=1",
         method: "GET",
         success: function (data) {
            let req = JSON.parse(data);
            tabsObj = {};
            for (var tabindex in req.stashes) {
               let tab = req.stashes[tabindex];
               if (tab.type == "NormalStash" || tab.type == "PremiumStash" || tab.type == "QuadStash") {
                  tabsObj[tab.id] = {
                     id: tab.id,
                     name: tab.name,
                     selected: false,
                     type: tab.type,
                     color: tab.metadata.colour
                  }
               }
            }
            if (tabsObj[id] && id != 0) {
               getTab(tabsObj[id].id);
            } else {
               let keys = Object.keys(tabsObj);
               getTab(tabsObj[keys[0]].id);
            }
         },
         error: function (e) {
            $(".content .loading").remove();
            $(".content").append(`<span class="autherr h4"><b>Error</b></span>`);
         }
      });
   }
}

function chTab(e) {
   $.each(tabsObj, function (i, tab) {
      tab.selected = false
   });
   let tab = $(e.currentTarget);
   $(".tabsbtn").removeClass("active");
   tab.addClass("active");
   let colorChTab = tab.attr("style").split(":")[1];
   $(".griditem").css("border", "1.5px solid " + colorChTab);
   getStash(tab.attr("data-id"));
}

function getTab(idTab = 0) {
   if (idTab != 0) {
      $.ajax({
         url: "/data.php?tab=1&id=" + idTab,
         method: "GET",
         success: function (data) {
            let req = JSON.parse(data);
            tabsObj[idTab].selected = true;
            setCookie('tabid', idTab, {
               expires: dateYear
            });
            darwTabs(req);
         },
         error: function (e) {
            $(".content .loading").remove();
            $(".content").append(`<span class="autherr h4"><b>Error</b></span>`);
         }
      });
   }
}

function darwTabs(obj) {
   $(".tabs").empty();
   let htmlTabs = "";
   $.each(tabsObj, function (i, tab) {
      let selected = tab.selected;
      tab.colour = hexToRgb(tab.color);
      let colorTab = `rgb(${tab.colour.r},${tab.colour.g},${tab.colour.b})`;

      let theme = Math.floor(Math.max(tab.colour.r, tab.colour.g, tab.colour.b) / 255 * 100) >= 50 ? "light" : "dark";

      if (selected) {
         colorSelectedTab = colorTab;
         if (tab.type == "QuadStash") {
            typeSelectedTab = "quad";
         } else if (tab.type == "PremiumStash" || tab.type == "NormalStash") {
            typeSelectedTab = "normal";
         }
      }
      htmlTabs += `
         <button type="button" data-id="${tab.id}" class="tabsbtn ${theme} ${selected ? "active" : ""}" style="background:${colorTab}">
            <b>${tab.name}</b>
         </button>`;
   });

   $(".tabs").append(htmlTabs);

   darwItems(obj.stash);
}

function darwItems(obj) {
   $(".itemsprices").empty();
   $(".griditem").empty();
   $(".griditem").css("border", "1.5px solid " + colorSelectedTab);
   $(".griditem").removeClass("quad normal").addClass(typeSelectedTab);
   $(".griditem").append(`<div class="lines"></div>`);
   $(".griditem").append(`<div class="items"></div>`);
   $(".griditem .lines").append(() => {
      let lines = "";
      let col = typeSelectedTab == "normal" ? 12 * 12 : 24 * 24;
      for (var l = 0; l < col; l++) {
         lines += "<i></i>"
      }
      return lines;
   });

   parseObjItems(obj.items);

   $.each(objectitems, function (i, item) {
      let itemHtml = `
       <div data-id="${i}" class="item" style="${item.position};">
       <div class="itembg ${item.isChecked ? "blue" : "red"}"></div>
          <img class="icon" src="${item.icon}">
       </div>`;

      $(".items").append(itemHtml);
   });

}

function parseObjItems(items) {
   objectitems = {};
   $.each(items, function (indx, i) {
      let item = i;

      let type = "";
      if (i.frameType == 2) {
         type = "Rare";
      }
      if (i.frameType == 3) {
         type = "Unique";
      }
      if (i.frameType == 4) {
         type = "Gem";
      }
      if (i.frameType == 5) {
         type = "Currency";
      }
      if (i.baseType.search(' Map') != -1) {
         type = "Map";
      }
      if (i.baseType.search('Contract:') != -1 || i.name.search('Contract:') != -1) {
         type = "Contract";
      }
      if (i.baseType.search('Blueprint:') != -1 || i.name.search('Blueprint:') != -1) {
         type = "Blueprint";
      }
      if (i.baseType.search('Maven\'s Invitation:') != -1 || i.name.search('Maven\'s Invitation:') != -1) {
         type = "Maven's Invitation";
      }

      item.type = type;
      item.class = i.icon.split('/')[6];
      item.isChecked = false;
      if (i.identified && type == "Rare") {
         item.isChecked = "Rare";
         item.b64 = convertb64(item);
      }
      if (i.identified && type == "Unique") {
         item.isChecked = "Unique";
      }
      if (i.identified && type == "Gem") {
         item.isChecked = "Gem";
      }
      item.position = `grid-area: ${i.y + 1} / ${i.x + 1} / ${i.y + 1 + i.h} / ${i.x + 1 + i.w}`;
      item.htmlHover = htmlHover(item);

      objectitems[i.id] = item;
   });
}

function convertb64(item) {
   let rarity = "Rare";

   if (item.frameType == 1) {
      rarity = "Magic";
   }
   if (item.frameType == 2) {
      rarity = "Rare";
   }
   if (item.frameType == 3) {
      rarity = "Unique";
   }
   if (item.frameType == 4) {
      rarity = "Gem";
   }

   let ilvl = "";
   if (item.ilvl) {
      ilvl = "Item Level: " + item.ilvl + "\n--------";
   }

   let properties = '';
   if (item.properties) {
      item.properties.forEach(function (property) {
         let prop = property.name;
         if (property.values.length) {
            prop += ": " + property.values[0][0];
         }
         properties += prop + "\n";
      });
      properties += '--------';
   }

   let requirements = '';
   if (item.requirements) {
      requirements = 'Requirements:\n';
      item.requirements.forEach(function (req) {
         let prop = req.name;
         if (req.values.length) {
            prop += ": " + req.values[0][0];
         }
         requirements += prop + "\n";
      });
      requirements += '--------';
   }

   let sockets = '';
   if (item.sockets) {
      sockets = 'Sockets:';
      item.sockets.forEach(function (req) {
         sockets += " " + req.sColour;
      });
      sockets += '\n--------';
   }

   let enchantMods = '';
   if (item.enchantMods) {
      item.enchantMods.forEach(function (req) {
         enchantMods += req + " (enchant)" + "\n";
      });
      enchantMods += '--------';
   }

   let implicitMods = '';
   if (item.implicitMods) {
      item.implicitMods.forEach(function (req) {
         implicitMods += req + " (implicit)" + "\n";
      });
      implicitMods += '--------';
   }

   let explicitMods = '';
   if (item.explicitMods) {
      item.explicitMods.forEach(function (req) {
         explicitMods += req + "\n";
      });
   }

   let influences = '';
   if (item.influences) {
      if (item.influences.shaper) {
         influences += "Shaper Item\n";
      }
      if (item.influences.elder) {
         influences += "Elder Item\n";
      }
      if (item.influences.crusader) {
         influences += "Crusader Item\n";
      }
      if (item.influences.redeemer) {
         influences += "Redeemer Item\n";
      }
      if (item.influences.hunter) {
         influences += "Hunter Item\n";
      }
      if (item.influences.warlord) {
         influences += "Warlord Item\n";
      }
   }

   let itemCopy = `Rarity: ${rarity}\n${item.name}\n${item.baseType}\n--------\n${properties ? properties+"\n" : ""}${requirements ? requirements+"\n" : ""}${sockets ? sockets+"\n" : ""}${ilvl ? ilvl+"\n" : ""}${enchantMods ? enchantMods+"\n" : ""}${implicitMods ? implicitMods+"\n" : ""}${explicitMods ? explicitMods : ""}${item.corrupted ? "--------\nCorrupted" : ""}${item.synthesised ? "--------\nSynthesised Item" : ""}${influences ? "--------\n"+influences : ""}`;

   itemCopy = window.btoa(unescape(encodeURIComponent(itemCopy)));

   return itemCopy;
}


function htmlHover(item) {

   let whych = ``;
   if (item.isChecked) {
      whych = `<b class="infoCh blue">Click on the item to check the price</b>`;
   } else {
      whych = `<b class="infoCh red">You can't check the price</b>`;
   }
   if (item.price) {
      let price;
      let prhtml;
      if (item.price.currency == "exalt") {
         price = item.price.price.toFixed(1);
         prhtml = `<b>${price}</b><i class="ex"></i>`;
      }
      if (item.price.currency == "chaos") {
         price = Math.floor(item.price.price);
         prhtml = `<b>${price}</b><i class="chaos"></i>`;
      }
      whych = `<b class="infoCh green">Item price: <span class="price">${prhtml}</span></b>`;
   }

   let rarity;
   if (item.frameType == 0) {
      rarity = "normal";
   }
   if (item.frameType == 1) {
      rarity = "magic";
   }
   if (item.frameType == 2) {
      rarity = "rare";
   }
   if (item.frameType == 3) {
      rarity = "unique";
   }
   if (item.frameType == 4) {
      rarity = "gem";
      item.baseType = item.typeLine;
   }
   if (item.frameType == 5) {
      rarity = "currency";
   }

   let ilvl;
   if (item.ilvl) {
      ilvl = `<div class="sect"><span><b>Item Level:</b> ${item.ilvl}</span></div>`;
   }

   let properties = '';
   if (item.properties) {
      item.properties.forEach(function (property) {
         let prop = property.name;
         if (property.values.length) {
            prop += ": " + property.values[0][0];
         }
         properties += `<span>${prop}</span>`;
      });
      properties = `<div class="sect">${properties}</div>`;
   }

   let requirements = '';
   if (item.requirements) {
      requirements = '<b>Requirements:</b> ';
      item.requirements.forEach(function (req) {
         let prop = req.name;
         if (req.values.length) {
            prop += ": " + req.values[0][0] + ",";
         }
         requirements += " " + prop;
      });
      requirements = `<div class="sect"><span>${requirements}</span></div>`;
   }

   let sockets = '';
   if (item.sockets) {
      sockets = '<b>Sockets:</b> ';
      item.sockets.forEach(function (req) {
         sockets += req.sColour;
      });
      sockets = `<div class="sect"><span>${sockets}</span></div>`;
   }

   let enchantMods = '';
   if (item.enchantMods) {
      item.enchantMods.forEach(function (req) {
         enchantMods += `<span>${req} (enchant)</span>`;
      });
      enchantMods = `<div class="sect">${enchantMods}</div>`;
   }

   let implicitMods = '';
   if (item.implicitMods) {
      item.implicitMods.forEach(function (req) {
         implicitMods += `<span>${req} (implicit)</span>`;
      });
      implicitMods = `<div class="sect">${implicitMods}</div>`;
   }

   let explicitMods = '';
   if (item.explicitMods) {
      item.explicitMods.forEach(function (req) {
         explicitMods += `<span>${req}</span>`;
      });
      explicitMods = `<div class="sect">${explicitMods}</div>`;
   }

   let influences = '';
   if (item.influences) {
      if (item.influences.shaper) {
         influences += "Shaper Item";
      }
      if (item.influences.elder) {
         influences += "Elder Item";
      }
      if (item.influences.crusader) {
         influences += "Crusader Item";
      }
      if (item.influences.redeemer) {
         influences += "Redeemer Item";
      }
      if (item.influences.hunter) {
         influences += "Hunter Item";
      }
      if (item.influences.warlord) {
         influences += "Warlord Item";
      }

      influences = `<div class="sect"><span><b>${influences}</b></span></div>`;
   }

   let html = `
   <div class="itemhover">
     <div class="name ${rarity}">
       ${item.name ? "<b>"+item.name+"</b>" : ""}
       <span>${item.baseType}</span>
     </div>
     ${whych}
     ${properties ? properties : ""}
     ${requirements ? requirements : ""}
     ${sockets ? sockets : ""}
     ${ilvl ? ilvl : ""}
     ${enchantMods ? enchantMods : ""}
     ${implicitMods ? implicitMods : ""}
     ${explicitMods ? explicitMods : ""}
     ${influences ? influences : ""}
     ${item.synthesised ? '<div class="sect"><span><b>Synthesised Item</b></span></div>' : ""}
     ${!item.identified ? '<div class="sect red"><span><b>Unidentified</b</span></div>' : ""}
     ${item.corrupted ? '<div class="sect red"><span><b>Corrupted</b</span></div>' : ""}
   </div>`;

   return html;
}

function priceCh(e = null, type = "all", iditem = 0) {
   let htmlLoading;
   let arrayIditems = [];

   let proc = 0;
   let minpr = Number($("#minPrice").val());

   if (type == "all") {
      let htmlLoading = `
     <div class="loading">
       <div class="spinner-border"></div>
       <div class="progressLoad"><i style="width:0%;"></i><b></b></div>
     </div>`;
      $(".itemsprices").append(htmlLoading);

      $.each(objectitems, function (indx, item) {
         if (item.isChecked && !item.price) {
            arrayIditems.push(indx);
         }
      })
   }
   if (type == "one") {
      htmlLoading = `
     <div class="loading">
       <div class="spinner-border"></div>
     </div>`;
      $(".itemsprices").append(htmlLoading);

      arrayIditems.push(iditem);
   }

   arrayIditems.asyncFor(function (item, i) {
         if (objectitems[item].isChecked == "Rare") {
            return new Promise((resolve, reject) => {
               $.ajax({
                  url: '/data.php?rare=1&b64=' + objectitems[item].b64,
                  method: "GET",
                  success: function (data) {
                     let price = JSON.parse(data);
                     price.price = price.min * (price.pred_confidence_score / 100);
                     if (Math.floor(price.price) >= minpr || price.currency == "exalt" || type == "one") {
                        objectitems[item].price = price;
                     }

                     if (arrayIditems.length > 1) {
                        proc = Math.round((i / (arrayIditems.length - 1)) * 100);
                        $(".itemsprices .loading .progressLoad i").css("width", proc + "%");
                        $(".itemsprices .loading .progressLoad b").text(`${i+1}/${(arrayIditems.length)} (${proc}%)`);
                     }
                     resolve();
                  },
                  error: function (e) {
                     info("error", 3000);
                     reject();
                  }
               });
            });
         }

         if (objectitems[item].isChecked == "Unique") {
            let uniqueName = objectitems[item].name;
            let uniqueBt = objectitems[item].baseType;
            let links = 0;
            if (objectitems[item].sockets) {
               let sockets = objectitems[item].sockets.reduce(function (previousValue, currentValue) {
                  previousValue[currentValue.group] += 1;
                  return previousValue;
               }, {
                  0: 0,
                  1: 0,
                  2: 0,
                  3: 0,
                  4: 0,
                  5: 0,
                  6: 0
               });
               Object.entries(sockets).forEach((element) => {
                  links = element[1] == 6 ? element[1] : links;
               })
            }

            return new Promise((resolve) => {
               let nameUrl = encodeURI(uniqueName);
               let btUrl = encodeURI(uniqueBt);

               $.ajax({
                  url: '/data.php?unique=1&name=' + nameUrl + '&bt=' + btUrl,
                  method: "GET",
                  success: function (data) {
                     let items = JSON.parse(data);
                     let itemU;
                     for (var it in items) {
                        if (links == 0 && !items[it].links) {
                           itemU = items[it];
                        } else if (links == 6 && items[it].links == 6) {
                           itemU = items[it];
                        } else if (links == 0 && items[it].links == 0) {
                           itemU = items[it];
                        }
                     }

                     let price = {};
                     if (itemU.exaltedValue > 0.5) {
                        price.price = itemU.exaltedValue;
                        price.currency = "exalt";
                     } else {
                        price.price = itemU.chaosValue;
                        price.currency = "chaos";
                     }

                     if (Math.floor(price.price) >= minpr || price.currency == "exalt" || type == "one") {
                        objectitems[item].price = price;
                     }

                     if (arrayIditems.length > 1) {
                        proc = Math.round((i / (arrayIditems.length - 1)) * 100);
                        $(".itemsprices .loading .progressLoad i").css("width", proc + "%");
                        $(".itemsprices .loading .progressLoad b").text(`${i+1}/${(arrayIditems.length)} (${proc}%)`);
                     }

                     resolve();
                  },
                  error: function (e) {
                     info("error", 3000);
                     reject();
                  }
               });
            });
         }

         if (objectitems[item].isChecked == "Gem") {

            let gemName = objectitems[item].typeLine;
            let prop = objectitems[item].properties;
            prop.corrupted = objectitems[item].corrupted;

            return new Promise((resolve) => {
               let nameUrl = encodeURI(gemName);
               $.ajax({
                  url: '/data.php?gems=1&name=' + nameUrl,
                  method: "GET",
                  success: function (data) {
                     let items = JSON.parse(data);

                     let itemGem = Object.entries(items).reduce(function (save, item) {
                        let col = colVariant(item[1].variant, prop);
                        if (col > save.col) {
                           save.col = col;
                           save.item = item;
                        }
                        return save;
                     }, {
                        col: 0,
                        item: null
                     }).item[1];


                     let price = {};
                     if (itemGem.exaltedValue > 0.5) {
                        price.price = itemGem.exaltedValue;
                        price.currency = "exalt";
                     } else {
                        price.price = itemGem.chaosValue;
                        price.currency = "chaos";
                     }
                     if (Math.floor(price.price) >= minpr || price.currency == "exalt" || type == "one") {
                        objectitems[item].price = price;
                     }
                     objectitems[item].baseType = "<b>(" + itemGem.variant + ")</b> " + gemName;

                     if (arrayIditems.length > 1) {
                        proc = Math.round((i / (arrayIditems.length - 1)) * 100);
                        $(".itemsprices .loading .progressLoad i").css("width", proc + "%");
                        $(".itemsprices .loading .progressLoad b").text(`${i+1}/${(arrayIditems.length)} (${proc}%)`);
                     }

                     resolve();
                  },
                  error: function (e) {
                     info("error", 3000);
                     reject();
                  }
               });
            });
         }
      },
      function () {
         if (type == "all") {
            drawPrices()
         }
         if (type == "one") {
            drawPrices(iditem)
         }
      });
}

function colVariant(variant, prop) {
   let sovp = 0;

   let level = parseInt(prop.find(x => x.name === "Level").values[0][0]);
   let Quality = parseInt(prop.find(x => x.name === "Quality").values[0][0]);
   let corrupted = prop.corrupted ? "c" : "";

   let split1 = variant.split("c");
   let split2 = split1[0].split("/");

   if ((split1.length == 2 && corrupted == "c") || (split1.length == 1 && corrupted == "")) {
      sovp += 1;
   }

   if (split2.length == 1 && Quality < 20) {
      sovp += 1;
   } else if (Quality == 20 && split2[1] == 20) {
      sovp += 1;
   } else if (Quality == 23 && split2[1] == 23) {
      sovp += 1;
   }

   if (split2[0] == 1 && level < 20) {
      sovp += 1;
   } else if (split2[0] == 20 && level == 20) {
      sovp += 1;
   } else if (split2[0] == 21 && level == 21) {
      sovp += 1;
   }

   return sovp;
}

function drawPrices(id = 0) {
   let minpr = Number($("#minPrice").val());
   let htmlallpr = '';

   let objit = {};
   if (id == 0) {
      objit = objectitems;
   } else {
      objit[0] = objectitems[id];
   }

   $.each(objit, function (indx, item) {
      if (item.price && $(".itemPrice[data-id=" + item.id + "]").length == 0) {
         let min = Math.floor(item.price.price);
         if (min >= minpr || item.price.currency == "exalt" || id != 0) {
            let prhtml;
            let sortnum = "0";
            if (item.price.currency == "exalt") {
               min = item.price.price.toFixed(1);
               sortnum = "1" + String(item.price.price.toFixed(1)).padStart(8, "0");
               prhtml = `<span>${min}</span><i class="ex"></i>`;
            }
            if (item.price.currency == "chaos") {
               min = Math.floor(item.price.price);
               sortnum = "0" + String(item.price.price.toFixed(1)).padStart(8, "0");
               prhtml = `<span>${min}</span><i class="chaos"></i>`;
            }
            htmlallpr += `
           <div data-id="${item.id}" data-sort="${sortnum}" class="itemPrice">
             <img class="icon" src="${item.icon}">
             <div class="namePr">
               ${item.name ? "<b>"+item.name+"</b>" : ""}
               <span>${item.baseType}</span>
             </div>
             <b class="price">
               ${prhtml}
             </b>
           </div>`;
            objectitems[item.id].htmlHover = htmlHover(item);
            $(".items .item[data-id=" + item.id + "]").find(".itembg").removeClass("blue").addClass("green");
         }
      }
   });
   if (htmlallpr == "") {
      info("There are no items", 2000);
   } else {
      $(".itemsprices").append(htmlallpr);
   }

   $('.itemsprices .itemPrice').sort(function (a, b) {
      let anum = $(a).attr('data-sort');
      let bnum = $(b).attr('data-sort');
      if (anum > bnum) {
         return -1;
      }
      if (anum < bnum) {
         return 1;
      }
      return 0;
   }).appendTo('.itemsprices');

   $(".itemsprices .loading").remove();
}

function info(text = "", time = 1000) {
   let info = $(`<span class="itemPriceInfo">${text}</span>`).appendTo(".itemsprices");
   setTimeout(() => {
      info.animate({
         opacity: 0
      }, 300, function () {
         info.remove();
      });
   }, time);
}

function hexToRgb(hex) {
   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
   } : null;
}

Object.defineProperty(Array.prototype, 'asyncFor', {
   value: function (func, done = () => false) {
      function loop(arr, i) {
         return new Promise((resolve, reject) => {
            if (i >= arr.length) {
               done();
               resolve();
            } else {
               Promise.resolve(func(arr[i], i))
                  .then(() => resolve(loop(arr, i + 1)))
                  .catch(reject);
            }
         });
      }
      return loop(this, 0);
   },
   enumerable: false,
   writable: true,
   configurable: true
});