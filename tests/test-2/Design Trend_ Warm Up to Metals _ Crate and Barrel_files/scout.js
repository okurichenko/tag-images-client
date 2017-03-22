(function(configVersion) {
  var environment = (location.href.match(/CMPRENV=([\w-]*)/) || [])[1];
  var appVersion = (location.href.match(/CMPRAPP=([\w\d.-]*)/) || [0,"v5.2.0"])[1];
  var fileName;
  var passedConfigs = {};
  var baseUrl;

  (function(context, scoutUrls, overrideUrls) {

    context.$EC = context.$CMPR = (context.$EC || {});
    var forceAB = (location.href.match(/EDGECASE=(ON|OFF)/i) || [])[1];
    var forceABSide = forceAB && forceAB.toLowerCase();
    var useOverrides = /CMPROVERRIDES=true/.test(location.href);
    var runtimeVersionOverride = (location.href.match(/CMPRVERSION=([A-Za-z0-9\.\-]*)/) || [])[1];
    var urls = useOverrides ? overrideUrls : scoutUrls;

    var thisUrl;
    var thisScript;
    var refScript = getRefScript();
    function noop() {}

    function getRefScript() {
      var scripts = document.querySelectorAll('script');
      return scripts[scripts.length - 1];
    }

    // Checking if it should load the environment override
    if ([].forEach && document.querySelectorAll) {
      [].forEach.call(document.querySelectorAll('script'), function(script) {
        var match = script.src &&
          // [full, protocol + ':', subdomain + '.', client, environment, fileBasename]
          script.src.split('?')[0]
            .match(/^(https?:)?\/\/([\w\.-]*)edgecasestatic.com\/([\w-]*)\/([\w-]*)\/([\.\w-]*)\.js$/);
        if (match) {
          thisScript = script;
          thisUrl = script.src.replace(/^(https?:)?\/\//, '');
          baseUrl = match[2] + 'edgecasestatic.com/' + match[3] + '/';
          fileName = match[5] + '.js';
          environment = environment || match[4];
        }
      });

      if (thisScript) {
        environment = (typeof(urls.environment) == 'function' ? urls.environment() : urls.environment) || environment;
        var moddedUrl = baseUrl + environment + '/' + fileName;
        if (thisUrl !== moddedUrl) {
          (context.$EC = (context.$EC || {})).configure = function(passedConfigs) {
            context.$EC.deferredConfigs = passedConfigs;
          };
          thisScript.parentNode.removeChild(thisScript);
          return appendAsset(moddedUrl);
        }
      }
    }

    // Setup A/B testing framework
    var abtest = function () {
      var namespace = 'edge';
      var namespaced = function(key) {
        return namespace + key;
      };
      var storage = window.localStorage;
      var storageAvailable = function () {
        var testKey = '__test__',
            testValue = 'foobar',
            isAvailable;
        try {
          storage.setItem(testKey, testValue);
          storage.getItem(testKey) === testValue;
          storage.removeItem(testKey);
          isAvailable = storage.getItem(testKey) === null;
        } catch(e) {
          console.error('localStorage error: ' + e.toString());
          isAvailable = false;
        }
        return isAvailable;
      }();

      return {
        active: function () {
          return ["production"].indexOf(environment) != -1;
        },
        clearBucket: function () {
          if (storageAvailable) { storage.removeItem(namespaced('Group')); }
          document.cookie = namespaced('Group') + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        },
        setBucket: function (bucket) {
          if (this.active()) {
            if (storageAvailable) { storage.setItem(namespaced('Group'), bucket); }
            document.cookie = namespaced('Group') + '=' + bucket + '; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT;';
          } else {
            if (storageAvailable) { storage.setItem(namespaced('Group'), 'on'); }
            document.cookie = namespaced('Group') + '=on; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT;';
          }
          this.setVersion(configVersion);
        },
        setVersion: function (version) {
          if (storageAvailable) { storage.setItem(namespaced('Version'), version); }
          document.cookie = namespaced('Version') + '=' + version + '; Path=/; Expires=Fri, 31 Dec 9999 23:59:59 GMT;';
        },
        getBucket: function () {
          var bucket;
          var cookieTest = ((document.cookie.match(namespaced('Group') + '=(on|off)') || [])[1] || undefined);
          var storageTest = storageAvailable ? storage.getItem(namespaced('Group')) : undefined;

          // Exit now if both tests are negative
          if (!cookieTest && !storageTest) {
            return;
          }

          // If the cookie exists, prefer its value
          bucket = cookieTest || storageTest;

          // Make sure the cookie and localstorage agree
          if (cookieTest !== storageTest) {
            this.setBucket(bucket);
          }

          return bucket;
        },
        getVersion: function () {
          var version;
          var cookieVersion = ((document.cookie.match(namespaced('Version') + '=([0-9]+);') || [])[1] || undefined);
          var storageVersion = storageAvailable ? storage.getItem(namespaced('Version')) : undefined;

          // Exit now if both tests are negative
          if (!cookieVersion && !storageVersion) {
            return;
          }

          // If the cookie exists, prefer its value
          version = cookieVersion || storageVersion;

          // Make sure the cookie and localstorage agree
          if (cookieVersion !== storageVersion) {
            this.setVersion(version);
          }

          return version;
        }
      };
    }();

    // Check for client control of A/B split
    if (/(on|off)/.test(context.$COHORT$)) {
      abtest.clearBucket();
      abtest.setBucket(context.$COHORT$);
    }

    // Check URL param for manual A/B split control
    if (forceAB) {
      abtest.clearBucket();
      abtest.setBucket(forceABSide);
    }

    // A/B split bust on upgrade?
    if (abtest.getVersion() !== configVersion && true) {
      abtest.clearBucket();
    }

    // Delegate group if no A/B split set yet
    if (!/(on|off)/.test(abtest.getBucket())) {
      abtest.setBucket(Math.random() <= 1 ? 'on' : 'off');
    }

    // Save environment to window global
    context.$CMPRENVIRONMENT$ = environment;

    // Do this right when the scout file is loaded, client accessible hook
    if (context.$CMPRSCOUTHOOK$) {
      $CMPRSCOUTHOOK$();
      delete context.$CMPRSCOUTHOOK$;
    }

    // Set our start-time
    context.$CMPRTZERO$ = new Date();

    // If we should be silent for any reason:
    //  * URL param: EDGECASE=(ON|OFF)
    //  * Window global "CMPRSILENCE" exists
    //  * Scout config-version is "silent"
    // And as long as we're not using CMPROVERRIDES or CMPRVERSION to modify load parameters...
    if (forceABSide === 'off' || (context.$CMPRSILENCE$ || configVersion.toLowerCase() == 'silent') && !(runtimeVersionOverride || useOverrides)){
      // Delete the CMPRSILENCE global, if it exists
      if (context.$CMPRSILENCE$)
        delete context.$CMPRSILENCE$;
      // Run and delete the CMPRNOINJECTHOOK global, if it exists
      if (context.$CMPRNOINJECTHOOK$) {
        $CMPRNOINJECTHOOK$();
        delete context.$CMPRNOINJECTHOOK$;
      }
      // Add enough noop function stubs to $EC global to keep calls to $EC from throwing errors
      context.$EC = {
        configure: noop,
        track: noop,
        transaction: {
          addTransaction: noop,
          addItem: noop,
          trackTransaction: noop
        }
      };
    } else (function(document, urls) {
      // Otherwise, proceed with injection

      // Bail now if browser matches our blacklist
      for(var ii = 0, blacklist = [].concat(/MSIE ?([5-9]|10)/); ii < blacklist.length; ii++)
        if (blacklist[ii].test(navigator.userAgent))
          return;

      // Set up $EC.track() function library
      context.$EC.track = function() {
        var transactionObj = {};
        var searchResultsObj = {};
        context.$ECFILTERSELECTIONS$ = [];
        context.$ECFILTERUNSELECTIONS$ = [];
        var eventTable = {
          'transaction:addTransaction': function(passed) {
            transactionObj = passed;
            if (transactionObj.id && transactionObj.revenue) {
              transactionObj.items = [];
            } else {
              console.error('[edgecase]: transaction:addTransaction missing required parameter(s); expected: id, revenue');
            }
          },
          'transaction:addItem': function(passed) {
            if (transactionObj.items) {
              if (passed.id && passed.sku && passed.price && passed.quantity) {
                transactionObj.items.push(passed);
              } else {
                console.error('[edgecase]: transaction:addItem missing required parameter(s); expected: id, sku, price, quantity');
              }
            } else {
              console.error('[edgecase]: cannot call addItem before addTransaction');
            }
          },
          'searchResults:addResults': function(passed) {
            searchResultsObj = passed;
            if (searchResultsObj.query && searchResultsObj.method && searchResultsObj.num_results) {
              searchResultsObj.skus = [];
            } else {
              console.error('[edgecase]: searchResults:addResults missing required parameter(s); expected: query, method, num_results');
            }
          },
          'searchResults:addProduct': function(passed) {
            if (searchResultsObj.skus) {
              if (searchResultsObj.page && searchResultsObj.page_size) {
                searchResultsObj.skus.push(passed.toString());
              } else {
                console.error('[edgecase]: cannot addProduct if addResults did not include page and page_size information');
              }
            } else {
              console.error('[edgecase]: cannot call addProduct before addResults');
            }
          },
          'filterAction:select': function(passed) {
            context.$ECFILTERSELECTIONS$.push(passed);
          },
          'filterAction:unselect': function(passed) {
            context.$ECFILTERUNSELECTIONS$.push(passed);
          },
          'send': function(eventType) {
            var eventPaths = {
              transaction: function() {
                if (transactionObj.id) {
                  context.$CMPRTRANSACTION$ = transactionObj;
                }
              },
              searchResults: function() {
                if (searchResultsObj.skus) {
                  context.$ECSEARCHRESULTS$ = searchResultsObj;
                }
              }
            };
            typeof eventPaths[eventType] === 'function' && eventPaths[eventType]();
          }
        };

        return function(directive, payload) {
          // If no args are passed, return the ability to list and register events
          if (arguments.length === 0) {
            return {
              list: function() {
                return Object.keys(eventTable);
              },
              register: function(key, handler) {
                if (typeof key === 'string' && typeof handler === 'function') {
                  eventTable[key] = handler;
                }
              },
              transactionObj: transactionObj,
              searchResultsObj: searchResultsObj
            };
          } else {
            // But if we have args, fire the specified event with the data provided
            typeof eventTable[directive] === 'function' && eventTable[directive](payload);
          }
        };
      }();

      // Set up shim for old $EC.transaction calls; forward info to $EC.track instead
      context.$EC.transaction = {
        addTransaction: function(orderId, storeName, total, tax, shipping, city, state, country) {
          context.$EC.track('transaction:addTransaction', {
            id: orderId || null,
            affiliation: storeName || null,
            revenue: total || null,
            shipping: shipping || null,
            tax: tax || null,

            // Legacy
            orderId: orderId || null,
            storeName: storeName || null,
            total: total || null,
            city: city || null,
            state: state || null,
            country: country || null
          });
        },
        addItem: function(orderId, productId, productName, categoryId, unitPrice, quantity) {
          context.$EC.track('transaction:addItem', {
            id: orderId || null,
            sku: productId || null,
            name: productName || null,
            category: categoryId || null,
            price: unitPrice || null,
            quantity: quantity || null,

            // Legacy
            orderId: orderId || null,
            productId: productId || null,
            productName: productName || null,
            categoryId: categoryId || null,
            unitPrice: unitPrice || null
          });
        },
        trackTransaction: function() {
          context.$EC.track('send', 'transaction');
        }
      };

      // Set up $EC.configure() function
      var configureLaunched = false;
      $EC.configure = function(passedConfigs) {

        // Prevent double-injection
        if (configureLaunched === true) return false;
        configureLaunched = true;

        passedConfigs = passedConfigs || context.$CMPRPASSEDCONFIGS$ || {};
        configVersion = runtimeVersionOverride || configVersion;

        context.$CMPRBACKENDURL$ = fnOrString(urls.backend);
        context.$CMPRASSETURL$ = fnOrString(urls.assets);
        context.$CMPRPRICECODE$ = passedConfigs.priceCode;
        context.$CMPRPASSEDCONFIGS$ = passedConfigs;

        var appurl = fnOrString(urls.app);

        // Return bgroup.js if user is in 'off' side of A/B test
        if (abtest.getBucket() === 'off' && abtest.active()) {
          var index = appurl.lastIndexOf("/") + 1;
          if(appurl.substr(index)!=='checkout.js'){
            appurl = appurl.substr(0,index) + 'bgroup.js';
          }
        }

        appendAsset(appurl);
        appendAsset(fnOrString(urls.config));

        function fnOrString(thing) {
          return typeof thing == 'string' ? thing : thing(passedConfigs);
        }
      };

      if (context.$EC.deferredConfigs) {
        context.$EC.configure(context.$EC.deferredConfigs);
        delete context.$EC.deferredConfigs;
      } else {
        context.$EC.configure();
      }

    })(document, urls);

    function appendAsset(url) {
      if (!refScript.parentNode) {
        refScript = getRefScript();
      }
      script = document.createElement('script');
      script.src = '//' + url;
      if (!refScript) {
        document.head.appendChild(script);
      } else {
        refScript.parentNode.insertBefore(script, refScript.nextSibling);
      }
    }

  })(this, {
    app: function (config, version, base) {
            var url = 'app.edgecasestatic.com/display/' + (appVersion || environment) + '/';
            if (Crate.Model && ~Crate.Model.Title.indexOf('Checkout') && pageData){
                if (pageData.items && pageData.items.length > 0 ){
                    $CMPR.transaction.addTransaction(
                        pageData.order.id,
                        document.domain,
                        Crate.Model.OrderSummary.Basket.GrandTotal,
                        Crate.Model.OrderSummary.Basket.TaxTotal,
                        Crate.Model.OrderSummary.Basket.LocalDeliveryCharge,
                        pageData.customer.postal,
                        pageData.customer.state,
                        pageData.customer.country
                    );
                    for (var i=0; i < pageData.items.length; i++){
                        $CMPR.transaction.addItem(
                            pageData.order.id,
                            pageData.items[i].sku,
                            pageData.items[i].productName,
                            pageData.items[i].productCategoryId,
                            pageData.items[i].price,
                            pageData.items[i].quantity
                        );
                    }
                  $CMPR.transaction.trackTransaction();
                }
                return url + 'checkout.js';
            }
            if (config.pageType == 'product')
                return url + 'pdp.js';
            if (/\/1/.test(location.pathname) || /\/living-room-collections/.test(location.pathname))
                return url + 'app.js';
            if (/\/1/.test(location.pathname) || /\/dining-room-collections/.test(location.pathname))
                return url + 'app.js';
            if (/\/1/.test(location.pathname) || /\/bedroom-collections/.test(location.pathname))
                return url + 'app.js';
            if (/\/1/.test(location.pathname) || /\/dinnerware-collections/.test(location.pathname))
                return url + 'app.js';
            if (/\/1/.test(location.pathname) || /\/area-rugs/.test(location.pathname))
                return url + 'app.js';
            if (/\/1/.test(location.pathname) || /\/outdoor-furniture-collections/.test(location.pathname))
                return url + 'app.js';
            if (/\/1/.test(location.pathname) || /\/occasional-table-collections/.test(location.pathname))
                return url + 'app.js';
            if (/\/1/.test(location.pathname) || /\/furniture-sectional-sofas/.test(location.pathname))
                return url + 'app.js';
        },
    config: function (config, version, base) {
            var url = 'config.edgecasestatic.com/v1/' + environment + '/crateandbarrel/';
            if (environment === 'staging')
                url = 'config.edgecasestaging.com/v1/' + environment + '/crateandbarrel/';
            else if (environment === 'development' || environment === 'production')
                url = 'config.edgecasestaging.com/v1/' + environment + '/crateandbarrel/';

            var catId;
            if (Crate.Model && ~Crate.Model.Title.indexOf('Checkout'))
                return url + 'checkout';
            if (config.pageType == 'product') {
                window.cmpr_product_id = config.productID;
                return url + 'product';
            }
            // if (/\/1/.test(location.pathname)){
            //     catId = Crate.Spill.config.categoryId;
            //     console.log('catId :', catId);
            //     return url + catId;
            // }
            if (/\/1-1-collection/.test(location.pathname)){
                catId = '15918';
                console.log('catId :', catId);
                return url + catId;
            }
            if (/\/living-room-collections/.test(location.pathname)) {
                catId = 'livingroomcollections';
                console.log('catId :', catId);
                return url + catId;
            }
            if (!(/\/1-1-collection/.test(location.pathname)) && (/\/dining-room-collections/.test(location.pathname))){
                catId = 'diningroomcollections';
                console.log('catId :', catId);
                return url + catId;
            }
            if (/\/bedroom-collections/.test(location.pathname)) {
                catId = 'bedroomcollections';
                console.log('catId :', catId);
                return url + catId;
            }
            if (/\/dinnerware-collections/.test(location.pathname)) {
                catId = 'dinnerwarecollections';
                console.log('catId :', catId);
                return url + catId;
            }
            if (/\/area-rugs/.test(location.pathname)) {
                catId = 'rugcollections';
                console.log('catId :', catId);
                return url + catId;
            }
            if (/\/outdoor-furniture-collections/.test(location.pathname)) {
                catId = 'outdoorcollections';
                console.log('catId :', catId);
                return url + catId;
            }
            if (/\/occasional-table-collections/.test(location.pathname)) {
                catId = 'occasionaltablecollections';
                console.log('catId :', catId);
                return url + catId;
            }
            if (/\/furniture-sectional-sofas/.test(location.pathname)) {
                catId = 'sectionalsofas';
                console.log('catId :', catId);
                return url + catId;
            }
            if (/\/1/.test(location.pathname)){
                catId = Crate.Spill.config.categoryId;
                console.log('catId :', catId);
                // catId = catId.toLowerCase();
                var microcatwhitelist = [];
                var artistsdesigners = [15189,15193,15195,15196,15197,15198,15199,15200,15201,15202,15206,15214,15223,15270,15301,15303,15310,15448,15450,15451,15452,15456,15457,15459,15460,15464,15465,15466,15467,15468,15516,15555,15616,15617,15620,15744,15747,15748,15750,15759,15766,15880,15883,15884,15886,15888,15889];
                var bath = [1627,1630,1640,16278,17590];
                var bed = [1622,1624,1628,1691,14401,14430,15140,17441];
                var businesssales = [951,6010,6030,15014];
                var candleholdersvases = [1330,1340,14221];
                var outdoorplantersgardening = [12300];
                var colortrends = [15871];
                var homeaccessories = [1439,1460,1470,1500,14180,14514,14862,16692,14412,17522];
                var pillowsthrows = [1276,1277,1279,1465,12200];
                var decor = [17365,17367,17368,17369];
                var walldecormirrors = [1520,14860,14861,14986,16412];
                var dinnerware = [14174,14375,14376,14377,14378,14380,16519,17520];
                var drinkware = [130,140,150,160,172,173,174,210,220,15992,16769,18079,18078];
                var flatware = [110,112,14870];
                var serveware = [190,245,295,375,491,722,14382,14383,14462,14484,15991,17907];
                var tablelinens = [430,440,445,450,14785,14786];
                var everydaybasics = [16452,16476,16482,16449,16429,16450,16474];
                var bedroom = [1010,1020,1030,1040,1045,14141];
                var diningkitchen = [880,891,898,900,910,14169,14539];
                var entryway = [14222,14540,14541,17446];
                var furniturecare = [14426];
                var homeoffice = [1070,1080,1090,1100];
                var livingroom = [930,940,949,14316,14323,14597,14610,14612,14614,14841,16752,16753,16754,16755,16943,17899];
                var giftsbyoccasion = [2020,2040,2060,2080,14868,16188,15513];
                var giftsbyprice = [2210,2220,2230,2240,14344,14591];
                var giftsbyrecipient = [2110,2115,2120,2140,2160,2190,14353,14429,16185,16694,17102,17103,17104,17105,17106];
                var giftsforall = [15830,14686];
                var giftswelove = [2010,2013];
                var familygifts = [15513,15596,16517,16729,17096,17100];
                var giftsthatgiveback = [17109];
                var giftsthatglow = [17107];
                var giftsthatshine = [17108];
                var backtocampus = [15621]; //empty
                var christmas = [17115,17019,17220,13,14424,15739,14348,15326,17019,15740,15757,15322,15758,15321,15320,15323,15327,15324,15325,14347,17115];
                var easter = [15520,16022,16023,16021,17352,17354];
                var fathersday = [14832]; //empty
                var fourthofjuly = [14823]; //empty
                var halloween = [15674];
                var hannukah = [24];
                var mothersday = [15061]; //empty
                var newyears = [15442];
                var passover = [16146]; //empty
                var cincodemayo = [17535];
                var stpatricksday = [16144]; //empty
                var thanksgiving = [16773,16770,16750];
                var valentinesday = [2018];
                var applianceselectronics = [630,632,634,636,638,640,15942];
                var coffeetea = [710,712,725,15535];
                var cookwarebakeware = [480,489,490,493,495,520,525,14465,14550,14551,15119];
                var cutlery = [580,590,600,605,608,15723];
                var gourmetfoodbev = [854];
                var kitchenaccessories = [210,660,670,690,744,746,748,762,768,790,850,855,1620];
                var kitchenlinens = [684];
                var collections = ['livingroomcollections','diningroomcollections','bedroomcollections','dinnerwarecollections','rugcollections','outdoorcollections','occasionaltablecollections','sectionalsofas'];
                var collectionschildren = []; //empty
                var shopbybrand = [17597, 17558,17577,17557,17536,17429,17430,17230,17125,15007,15009,15010,15090,15093,15094,15095,15096,15097,15098,15099,15264,15265,15266,15267,15268,15269,15276,15277,15279,15280,15823,16010,16652,16986,16983,16537,16987,16688,16985,16984,16749];
                var lighting = [1220,1230,1240,1245,15474,14432,17873];
                var newcats = [8052,10665,14299,14301,14303,14415,15654,15718,14773];
                var organizationbath = [14692];
                var organizationcleaning = [15600];
                var organizationcloset = [14598];
                var organizationfurniture = [1135,14476,14695,15077,16280];
                var organizationkitchen = [14549,14600];
                var organizationlaundry = [14599];
                var organizationstepstools = []; //empty
                var organizationstorageaccessories = [14399,14411,14412];
                var organizationtravelaccessories = [14537];
                var organizationvacuums = [15469];
                var outdooraccessories = []; //empty
                var outdoorentertaining = [14210,15085,15505];
                var outdoorfurniturebymaterial = [15964,15965,15966];
                var outdoorfurniturebytype = [14440,14446,14691,14765,15497,15767,15768];
                var outdoor = [12500,15492,12100];
                var curtainshardware = [1285,1288];
                var rugs = [1268,1610,14280,14354,1261,1267,17278];
                var clearance = [14493,15030,15031,15032,15033,15035,15104];
                var freeshipping = [15550,15551,15552,15554,15556];
                var limited = [16526,17095,15286,15558,17149,15560,17151,17229,15815,17228,15437,15855];
                var outlet = [14543,14545,14546,14548,14608,15470,15703,17526];
                var specialfeatures = [15521,15652,17559,17587,17750,15665];
                var topratedbedbath = [14396];
                var toprateddecorpillows = [14302];
                var toprateddiningentertaining = [14677];
                var topratedfurniture = [14676];
                var topratedkitchen = [14300];
                var topratedlighting = [15668];
                var topratedorganization = [14414];
                var topratedoutdoor = [15666];
                var topratedrugscurtains = [15667];

                /* category whitelist based on environment */
                if (environment == 'production'){
                    microcatwhitelist = [].concat.apply([], [collectionschildren,cincodemayo,specialfeatures,decor,outdoorplantersgardening, collections, bath, bed, businesssales, candleholdersvases, homeaccessories, pillowsthrows, walldecormirrors, colortrends, dinnerware, drinkware, flatware, serveware, tablelinens, everydaybasics, bedroom, diningkitchen, entryway, furniturecare, homeoffice, livingroom, giftsbyoccasion, giftsbyprice, giftsbyrecipient, giftsforall, giftswelove, backtocampus, christmas, easter, fathersday, fourthofjuly, halloween, hannukah, mothersday, newyears, passover, stpatricksday, thanksgiving, valentinesday, applianceselectronics, coffeetea, cookwarebakeware, cutlery, gourmetfoodbev, kitchenaccessories, kitchenlinens, shopbybrand, lighting, newcats, organizationbath, organizationcleaning, organizationcloset, organizationfurniture, organizationkitchen, organizationlaundry, organizationstepstools, organizationstorageaccessories, organizationtravelaccessories, organizationvacuums, outdooraccessories, outdoorentertaining, outdoorfurniturebymaterial, outdoorfurniturebytype, curtainshardware, rugs, clearance, freeshipping, limited, outlet, topratedbedbath, toprateddecorpillows, toprateddiningentertaining, topratedfurniture, topratedkitchen, topratedlighting, topratedorganization, topratedoutdoor, topratedrugscurtains, giftsthatshine, giftsthatglow, giftsthatgiveback, familygifts, outdoor]);
                } else {
                    microcatwhitelist = [].concat.apply([], [collectionschildren,cincodemayo,specialfeatures,decor,outdoorplantersgardening, collections, bath, bed, businesssales, candleholdersvases, homeaccessories, pillowsthrows, walldecormirrors, colortrends, dinnerware, drinkware, flatware, serveware, tablelinens, everydaybasics, bedroom, diningkitchen, entryway, furniturecare, homeoffice, livingroom, giftsbyoccasion, giftsbyprice, giftsbyrecipient, giftsforall, giftswelove, backtocampus, christmas, easter, fathersday, fourthofjuly, halloween, hannukah, mothersday, newyears, passover, stpatricksday, thanksgiving, valentinesday, applianceselectronics, coffeetea, cookwarebakeware, cutlery, gourmetfoodbev, kitchenaccessories, kitchenlinens, shopbybrand, lighting, newcats, organizationbath, organizationcleaning, organizationcloset, organizationfurniture, organizationkitchen, organizationlaundry, organizationstepstools, organizationstorageaccessories, organizationtravelaccessories, organizationvacuums, outdooraccessories, outdoorentertaining, outdoorfurniturebymaterial, outdoorfurniturebytype, outdoor, curtainshardware, rugs, clearance, freeshipping, limited, outlet, topratedbedbath, toprateddecorpillows, toprateddiningentertaining, topratedfurniture, topratedkitchen, topratedlighting, topratedorganization, topratedoutdoor, topratedrugscurtains, giftsthatshine, giftsthatglow, giftsthatgiveback, familygifts]);
                }

                // check if the category is active, if not, return a pixel
                if (microcatwhitelist.indexOf(Crate.Spill.config.categoryId) != -1) {
                    catId = Crate.Spill.config.categoryId;
                    return url + catId;
                } else {
                    console.log("Edgecase Silent");
                    return 'app.edgecasestatic.com/legacy/pixel.gif';
                }
            }
        },
    backend: function () {
            if (environment === 'staging')
                return 'sora.edgecasestaging.com/v2';
            else if (environment === 'development' || environment === 'production')
                return 'sora.edgecasestaging.com/v2';
            return 'sora.edgecasestaging.com/v2';
        },
    assets: function () {
            return '//' + baseUrl + environment + '/' + configVersion + '/assets';
        }
  }, {
    app: function (config) {
            var base = 'localhost:8000/app/build/';
            if (Crate.Model && ~Crate.Model.Title.indexOf('Checkout') && pageData){
                if (pageData.items && pageData.items.length > 0 ){
                    $CMPR.transaction.addTransaction(
                        pageData.order.id,
                        document.domain,
                        Crate.Model.OrderSummary.Basket.GrandTotal,
                        Crate.Model.OrderSummary.Basket.TaxTotal,
                        Crate.Model.OrderSummary.Basket.LocalDeliveryCharge,
                        pageData.customer.postal,
                        pageData.customer.state,
                        pageData.customer.country
                    );
                    for (var i=0; i < pageData.items.length; i++){
                        $CMPR.transaction.addItem(
                            pageData.order.id,
                            pageData.items[i].sku,
                            pageData.items[i].productName,
                            pageData.items[i].productCategoryId,
                            pageData.items[i].price,
                            pageData.items[i].quantity
                        );
                    }
                  $CMPR.transaction.trackTransaction();
                }
                return base + 'checkout.js';
            }
            if (config.pageType == 'product')
                return base + 'pdp.js';
            if (/\/1/.test(location.pathname) || /\/living-room-collections/.test(location.pathname))
                return base + 'app.js';
            if (/\/1/.test(location.pathname) || /\/dining-room-collections/.test(location.pathname))
                return base + 'app.js';
            if (/\/1/.test(location.pathname) || /\/bedroom-collections/.test(location.pathname))
                return base + 'app.js';
            if (/\/1/.test(location.pathname) || /\/dinnerware-collections/.test(location.pathname))
                return base + 'app.js';
            if (/\/1/.test(location.pathname) || /\/area-rugs/.test(location.pathname))
                return base + 'app.js';
            if (/\/1/.test(location.pathname) || /\/outdoor-furniture-collections/.test(location.pathname))
                return base + 'app.js';
            if (/\/1/.test(location.pathname) || /\/occasional-table-collections/.test(location.pathname))
                return base + 'app.js';
            if (/\/1/.test(location.pathname) || /\/furniture-sectional-sofas/.test(location.pathname))
                return base + 'app.js';
        },
    config: function (config) {
            var base = 'localhost:8888/v1/local/crateandbarrel/';
            var catId;
            if (Crate.Model && ~Crate.Model.Title.indexOf('Checkout'))
                return base + 'checkout';
            if (config.pageType == 'product') {
                window.cmpr_product_id = config.productID;
                return base + 'product';
            }
            if (/\/1/.test(location.pathname)) {
                catId = Crate.Spill.config.categoryId;
                console.log('catId :', catId);
                return base + catId;
            }
            if (/\/living-room-collections/.test(location.pathname)) {
                catId = 'livingroomcollections';
                console.log('catId :', catId);
                return base + catId;
            }
            if (/\/dining-room-collections/.test(location.pathname)) {
                catId = 'diningroomcollections';
                console.log('catId :', catId);
                return base + catId;
            }
            if (/\/bedroom-collections/.test(location.pathname)) {
                catId = 'bedroomcollections';
                console.log('catId :', catId);
                return base + catId;
            }
            if (/\/dinnerware-collections/.test(location.pathname)) {
                catId = 'dinnerwarecollections';
                console.log('catId :', catId);
                return base + catId;
            }
            if (/\/area-rugs/.test(location.pathname)) {
                catId = 'rugcollections';
                console.log('catId :', catId);
                return base + catId;
            }
            if (/\/outdoor-furniture-collections/.test(location.pathname)) {
                catId = 'outdoorcollections';
                console.log('catId :', catId);
                return base + catId;
            }
            if (/\/occasional-table-collections/.test(location.pathname)) {
                catId = 'occasionaltablecollections';
                console.log('catId :', catId);
                return base + catId;
            }
            if (/\/furniture-sectional-sofas/.test(location.pathname)) {
                catId = 'sectionalsofas';
                console.log('catId :', catId);
                return base + catId;
            }
        },
    backend: function () {
            if (environment === 'staging')
                return 'sora.edgecasestaging.com/v2';
            else if (environment === 'development' || environment === 'production')
                return 'sora.edgecasestaging.com/v2';
            return 'sora.edgecasestaging.com/v2';
        },
    assets: "http://localhost:8000/assets"
  });
})('1488257021630');
