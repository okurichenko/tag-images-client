_satellite.pushBlockingScript(function(event, target, $variables){
  if(typeof(omntag) == "undefined"){
  window.omntag = {}; 
}

omntag.clearAfterTrackFunc = function(){
   if(omntag.clearAfterTrack){
      if(typeof(omntag.clearAfterTrack)=="object"){
          //Array
          $(omntag.clearAfterTrack).each(function(){
             omntag.s[this] = ""; 
          });
      }
     
     omntag.clearAfterTrack = "";
  }
}
omntag.t = function(){
  var omntag = window.omntag || {};
  var dataLayer = window.Crate || {};
  omntag.PullFromDataLayer(omntag, dataLayer);
  
  if( omntag.postPageView == true){
    omntag.initialPageName = omntag.s.pageName;
    omntag.CopyVars();
  	omntag.s.t();
    omntag.s.pageName = omntag.initialPageName;
  }
  
  omntag.postPageView = true;
  //Optional - clear out vars
  omntag.clearAfterTrackFunc();
};

window.omntag.tl =  function(){
  var tp = arguments[0] || this;
  var lnk = arguments[1] || "";
  var name = arguments[2] || "";
  omntag.CopyVars();
  omntag.s.tl(tp, lnk, name);
  
  //Optional - clear out vars
  omntag.clearAfterTrackFunc();

};

omntag.CopyVars = function(){
   var s = omntag.s;
    $.each( omntag, function( key, value ) {
        if(typeof(value) == "string")
            s[key] = value;
    }); 
};

omntag.PullFromDataLayer = function(omntag, Crate) {
    //if (typeof omntag === "undefined") omntag = {};
    if (typeof Crate === "undefined") Crate = {};

    if( omntag.s )
	   omntag.s.products = omntag.products;
       
    if (Crate.Model) {
        var model = Crate.Model;
        omntag.pageName = getDefaultTitle()
        omntag.server = model.Server;
        if (model.ActionName == 'Browse.Home.Index') {
            omntag.prop5 = "Home Page";
            omntag.prop6 = "Home Page";
            omntag.pageName = "Crate Home Page";
            omntag.channel = "home page";
            omntag.eVar8 = "Home Page";
            omntag.eVar11 = model.Zipcode;
        } else if (model.ActionName == 'Browse.Category.Index') {
            omntag.prop5 = "Browse";
            omntag.prop6 = "Category";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + " Category";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.eVar5 = walkCategories(category);
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            if (model.IsSupercategory) {
                omntag.prop6 = "SuperCategory";
                omntag.pageName = walkCategories(category) + " SuperCategory";
            }
          
        } else if (model.ActionName == 'Browse.Category.Index2') {
            omntag.prop5 = "Browse";
            omntag.prop6 = "Category";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + " Category";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.eVar5 = walkCategories(category);
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            if (model.IsSuperCategory) {
                omntag.prop6 = "SuperCategory";
                omntag.pageName = walkCategories(category) + " SuperCategory";
            }
        } else if (model.ActionName == 'Browse.Spill.Index') {
            omntag.prop5 = "Browse";
            omntag.prop6 = "Spill Page";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + " Spill Page (1)";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.eVar5 = walkCategories(category);
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            omntag.eVar39 = model.SelectedSortBy;
            if (omntag.eVar39)
                omntag.events = "event64";
                  
        } else if (model.ActionName == 'Browse.FurnitureSpill.Index') {
            omntag.prop5 = "Browse";
            omntag.prop6 = "Spill Page";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + " Spill Page (1)";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.eVar5 = walkCategories(category);
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            omntag.eVar39 = model.SelectedSortBy;
            if (omntag.eVar39)
                omntag.events = "event64";
          
         } else if (model.ActionName == 'Browse.HousewaresSpill.Index') {
            omntag.prop5 = "Browse";
            omntag.prop6 = "Spill Page";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + " Spill Page (1)";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.eVar5 = walkCategories(category);
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            omntag.eVar39 = model.SelectedSortBy;
            if (omntag.eVar39)
                omntag.events = "event64";  
        } else if (model.ActionName == 'Browse.SeoSpill.Index') {
            omntag.prop5 = "Thematic";
            omntag.prop6 = "Thematic";
            omntag.prop14 = "Thematic";
            omntag.eVar8 = "Thematic"
            omntag.pageName = model.Title + " Thematic"; 
            omntag.channel = "thematic";
        } else if (model.ActionName == 'Browse.Search.Index') {
            omntag.prop5 = "Search Results";
            omntag.prop6 = "Search Results";
            omntag.prop16 = model.SearchTerm;
            omntag.prop17 = model.TotalCount;
            omntag.pageName = "Search";
            omntag.channel = "search";
            omntag.eVar8 = "Search";
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
            omntag.eVar39 = model.SelectedSortBy;
            if (omntag.eVar39)
                omntag.events = "event64";
        } else if (model.PageName == 'Browse.Search.SearchDetail') {
            omntag.prop5 = "Search Results";
            omntag.prop6 = "Search Results";
            omntag.prop16 = model.SearchTerm;
            omntag.prop17 = model.TotalCount;
            omntag.pageName = "Search";
            omntag.channel = "search";
            omntag.eVar8 = "Search";
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
            omntag.eVar39 = model.SelectedSortBy;
            omntag.porducts = '';
            if (omntag.eVar39)
                omntag.events = "event64";   
       } else if (model.ActionName == 'Browse.Product.Index') {
           omntag.prop5 = "Browse";
            omntag.prop6 = "Product";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + ":" + model.Name + " SKU " + model.Sku + " Product Page";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.events = "prodView";
            omntag.products = ";" + model.Sku + ";;;;eVar28=" + getAvailabilityMessage(model.Availability.StatusCode) +"|eVar31=" + isOnSale(model);
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
         
       } else if (model.ActionName == 'Browse.Product.Housewares') {
           omntag.prop5 = "Browse";
            omntag.prop6 = "Product";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + ":" + model.Name + " SKU " + model.Sku + " Product Page";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.events = "prodView";
            omntag.products = ";" + model.Sku + ";;;;eVar28=" + getAvailabilityMessage(model.Availability.StatusCode) +"|eVar31=" + isOnSale(model);
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
         
       } else if (model.ActionName == 'Browse.FurnitureProduct.Index') {
            omntag.prop5 = "Browse";
            omntag.prop6 = "Product";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + ":" + model.Name + " SKU " + model.Sku + " Product Page";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.events = "prodView";
            omntag.products = ";" + model.Sku + ";;;;eVar28=" + getAvailabilityMessage(model.AvailabilityMessaging.StatusCode)+"|eVar31=" + isOnSale(model);
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;  

        } else if (model.ActionName == 'Crate.Browse.FurnitureProduct.Index') {
            omntag.prop5 = "Browse";
            omntag.prop6 = "Product";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + ":" + model.Name + " SKU " + model.Sku + " Product Page";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.events = "prodView";
            omntag.products = ";" + model.Sku + ";;;;eVar28=" + getAvailabilityMessage(model.AvailabilityMessaging.StatusCode)+"|eVar31=" + isOnSale(model);
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;  
          
        } else if (model.ActionName == 'Browse.Family.Index') {
            omntag.prop5 = "Browse";
            omntag.prop6 = "Family";
            var category = model.Category;
            var superCategory = getSuperCategory(category);
            omntag.pageName = walkCategories(category) + ":" + model.Name + " Family Page";
            if (superCategory && superCategory.Name) omntag.channel = superCategory.Name.replace("&", "and").toLowerCase();
            omntag.events = "prodView";
            var products = "";
            omntag.products = "";
            for (var i=0; i < Crate.Model.ProductList.length; i++) {
            var product = Crate.Model.ProductList[i];
            omntag.products += ";" + product.Sku + ";;;;eVar28=" + getAvailabilityMessage(product.Availability.StatusCode) +"|eVar31=" + isOnSale(product) + ",";
              }
            omntag.eVar8 = superCategory.Name.replace("&", "and");
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Browse.Product.StoreAvailabilityLayer') {
            omntag.prop5 = "Stores";
            omntag.prop6 = "Store Availability";
            omntag.pageName = "Store Availability";
            omntag.channel = "stores";
            omntag.eVar8 = "Stores";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'GiftRegistry.FindRegistry.Index') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "Give A Gift";
            omntag.pageName = "Find a Registry";
            omntag.channel = "gift registry - give a gift";
            omntag.eVar8 = "Gift Registry - Give A Gift";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'GiftRegistry.FindRegistry.Main') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "Registry Main Page";
            omntag.pageName = "Gift Registry Main Page";
            omntag.channel = "gift registry";
            omntag.eVar5 = "Gift Registry";
            omntag.eVar8 = "Gift Registry";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
       } else if (model.ActionName == 'GiftRegistry.FindRegistry.FindRegistryResults') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "Give A Gift";
            omntag.pageName = "Find a Registry Search Results";
            omntag.channel = "gift registry - give a gift";
            omntag.eVar8 = "Gift Registry - Give A Gift";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'GiftRegistry.ViewRegistry.Index') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "Give A Gift";
            omntag.pageName = "Show Registry List Page";
            omntag.channel = "gift registry - give a gift";
            omntag.events = "prodView";
            var products = "";
            for (var i=0; i < Crate.Model.RegistryItems.length; i++) {
            var product =Crate.Model.RegistryItems[i];
            omntag.products += ";" + product.Sku + ";;;;,";
              }
            omntag.eVar8 = "Gift Registry - Give A Gift";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
            omntag.eVar39 = model.SortBy;
        } else if (model.ActionName == 'GiftRegistry.ManageRegistry.Index') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "Manage Registry";
            omntag.pageName = "Manage Registry";
            omntag.channel = "gift registry - edit";
            omntag.eVar8 = "Gift Registry - Edit";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'GiftRegistry.CreateRegistry.Index') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "Create Registry";
            omntag.pageName = "Create Registry";
            omntag.channel = "gift registry - edit";
            omntag.eVar8 = "Gift Registry - Edit";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'GiftRegistry.CreateRegistry.RegistryCreated') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "Registry Created";
            omntag.pageName = "Registry Created";
            omntag.channel = "gift registry - edit";
            omntag.events = "event1";
            omntag.eVar8 = "Gift Registry - Edit";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'GiftRegistry.SignInToRegistry.Index') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "My Registry - Sign In";
            omntag.pageName = "My Registry - Sign In";
            omntag.channel = "gift registry - edit";
            omntag.eVar8 = "Gift Registry - Edit";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'GiftRegistry.ManageRegistry.SelectRegistry') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "Select Registry";
            omntag.pageName = "Select Registry";
            omntag.channel = "gift registry - edit";
            omntag.eVar8 = "Gift Registry - Edit";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'GiftRegistry.ManageRegistry.HomeRegistry') {
            omntag.prop5 = "Gift Registry";
            omntag.prop6 = "Item List Page";
            omntag.pageName = "Item List Page";
            omntag.channel = "gift registry - edit";
            omntag.eVar8 = "Gift Registry - Edit";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Account.Login.Index') {
            omntag.prop5 = "My Account";
            omntag.prop6 = "My Account";
            omntag.pageName = "Account Login";
            omntag.channel = "my account";
            omntag.eVar8 = "My Account";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Account.MyAccount.Index') {
            omntag.prop5 = "My Account";
            omntag.prop6 = "My Account";
            omntag.pageName = "My Account";
            omntag.channel = "my account";
            omntag.eVar8 = "My Account";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Account.OrderTracking.Index') {
            omntag.prop5 = "My Account";
            omntag.prop6 = "My Account";
            omntag.pageName = "Order Tracking";
            omntag.channel = "my account";
            omntag.eVar8 = "My Account";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Account.Favorites.Index') {
            omntag.prop5 = "My Account";
            omntag.prop6 = "My Account:: Favorites";
            omntag.pageName = "Favorites List Page";
            omntag.channel = "favorites";
            omntag.events = "prodView";
            var products = "";
            for (var i=0; i < Crate.Model.Items.length; i++) {
            var product = Crate.Model.Items[i];
            omntag.products += ";" + product.Sku + ";;;;,";
              }
            omntag.eVar8 = "Favorites";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Account.EditBilling.Index') {
            omntag.prop5 = "My Account";
            omntag.prop6 = "My Account";
            omntag.pageName = "Update Account";
            omntag.channel = "my account";
            omntag.eVar8 = "My Account";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Account.EditSavedPayments.Index') {
            omntag.prop5 = "My Account";
            omntag.prop6 = "My Account";
            omntag.pageName = "Payments";
            omntag.channel = "my account";
            omntag.eVar8 = "My Account";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Account.EditSignIn.Index') {
            omntag.prop5 = "My Account";
            omntag.prop6 = "My Account";
            omntag.pageName = "Sign In Update";
            omntag.channel = "my account";
            omntag.eVar8 = "My Account";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
       } else if (model.ActionName == 'GiftCards.GiveGiftCard.Index') {
            omntag.prop5 = "Gift Cards";
            omntag.prop6 = "Gift Cards";
            omntag.pageName = "Gift Card Splash Page";
            omntag.channel = "gift cards";
            omntag.events = "prodView";
            omntag.products = ";(999055) Gift Card;;;;";
            omntag.eVar8 = "Gift Cards";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'GiftCards.CheckCardBalance.Index') {
            omntag.prop5 = "My Account";
            omntag.prop6 = "My Account";
            omntag.pageName = "Gift Card Check Balance";
            omntag.channel = "my account";
            omntag.eVar8 = "My Account";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Stores.Stores.Locator') {
            omntag.prop5 = "Stores";
            omntag.prop6 = "Stores Locator";
            omntag.pageName = "Stores Search Results";
            omntag.channel = "stores";
            omntag.eVar8 = "Stores";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Stores.Stores.List-Outlet') {
            omntag.prop5 = "Stores";
            omntag.prop6 = "Outlet Stores";
            omntag.pageName = "Outlet Stores";
            omntag.channel = "stores";
            omntag.eVar8 = "Stores";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'CustomerService.ContactUs.Index') {
            omntag.pageName = "Contact Us";
            omntag.channel = "customer-service";
            omntag.eVar8 = "Customer-Service";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar11 = model.Zipcode;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Checkout.Cart.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Cart";
            omntag.pageName = "Order Form: Basket";
            omntag.channel = "cart";
            omntag.events = "scView";
            var products = "";
            if (Crate.Model.ProductList) {
            for (var i=0; i < Crate.Model.ProductList.length; i++) {
            var product = Crate.Model.ProductList[i];
            omntag.products += ";" + product.HiddenBaseSku + ";;;;,";
              }
            }
            omntag.eVar8 = "Cart";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
            omntag.eVar11 = model.Zipcode;
        } else if (model.ActionName == 'Checkout.Login.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Login";
            omntag.pageName = "Order Form: Login";
            omntag.channel = "checkout";
            omntag.events = "scCheckout";
            omntag.eVar7 = model.UserName;
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.UserName;
        } else if (model.ActionName == 'Checkout.MultiShipping.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Multi-Address Shipping";
            omntag.pageName = "Order Form: Multi-Address Shipping";
            omntag.channel = "checkout";
            omntag.events = "scCheckout";
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Checkout.ShippingAddress.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Guest Shipping";
            omntag.pageName = "Order Form: Guest Shipping";
            omntag.channel = "checkout";
            omntag.events = "scCheckout";
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Checkout.BillingAddress.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Billing Address";
            omntag.pageName = "Order Form: Billing Address";
            omntag.channel = "checkout";
            omntag.events = "scCheckout";
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Checkout.billingaddress.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Billing Address";
            omntag.pageName = "Order Form: Billing Address";
            omntag.channel = "checkout";
            omntag.events = "scCheckout";
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Checkout.DeliveryAndGiftOptions.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Shipping Details";
            omntag.pageName = "Order Form: Shipping Details";
            omntag.channel = "checkout";
            omntag.events = "scCheckout";
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Checkout.Payment.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Payment Info";
            omntag.pageName = "Order Form: Payment Info";
            omntag.channel = "checkout";
            omntag.events = "scCheckout";
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
        } else if (model.ActionName == 'Checkout.PaymentTns.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Payment Info";
            omntag.pageName = "Order Form: Payment Info";
            omntag.channel = "checkout";
            omntag.events = "scCheckout";
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;  
        } else if (model.ActionName == 'Checkout.Review.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Review";
            omntag.pageName = "Order Form: Review";
            omntag.channel = "checkout";
            omntag.events = "scCheckout";
            omntag.eVar6 = model.BillingAddress.ZIP;
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.UserName;
            omntag.eVar9 = model.AccountEmail;
            omntag.eVar16 = model.ErrorMessage;
       } else if (model.ActionName == 'Checkout.Confirmation.Index') {
            omntag.prop5 = "Checkout";
            omntag.prop6 = "Checkout Order Complete";
            omntag.pageName = "Order Form: Confirmed";
            omntag.channel = "checkout";
            //Purchase ID       
            omntag.purchaseID = model.OrderInfo.OrderNumberAS400.toString();
         		//s.products
            var products = "";
            for (var i=0; i < Crate.Model.DeliveryAndGOpt.ShOptRecipient.length; i++) {
            var recipient = Crate.Model.DeliveryAndGOpt.ShOptRecipient[i];
            for (var j=0; j < recipient.BasicFreightShippingItems.length; j++) {
            var product = recipient.BasicFreightShippingItems[j];
            omntag.products += ";" + product.Sku + ";" + product.Quantity + ";" + (product.CurrentPrice/100*product.Quantity).toFixed(2) + ";" + "event67=" + (product.CurrentPrice/100*product.Quantity).toFixed(2) + ";" + "eVar53=" + product.CalculatedShipMethodName.replace(" ","").replace("-","") + ",";
               }
            for (var j=0; j < recipient.FurnitureShippingItems.length; j++) {
            var product = recipient.FurnitureShippingItems[j];
            omntag.products += ";" + product.Sku + ";" + product.Quantity + ";" + (product.CurrentPrice/100*product.Quantity).toFixed(2) + ";" + "event67=" + (product.CurrentPrice/100*product.Quantity).toFixed(2) + ";" + "eVar53=" + product.CalculatedShipMethodName.replace(" ","").replace("-","") + ",";
               }
            for (var j=0; j < recipient.ParcelShippingItems.length; j++) {
            var product = recipient.ParcelShippingItems[j];
            omntag.products += ";" + product.Sku + ";" + product.Quantity + ";" + (product.CurrentPrice/100*product.Quantity).toFixed(2) + ";" + "event67=" + (product.CurrentPrice/100*product.Quantity).toFixed(2) + ";" + "eVar53=" + product.CalculatedShipMethodName.replace(" ","").replace("-","") + ",";
               }
            for (var j=0; j < recipient.PersonalizedShippingItems.length; j++) {
            var product = recipient.PersonalizedShippingItems[j];
            omntag.products += ";" + product.Sku + ";" + product.Quantity + ";" + (product.CurrentPrice/100*product.Quantity).toFixed(2) + ";" + "event67=" + (product.CurrentPrice/100*product.Quantity).toFixed(2) + ";" + "eVar53=" + product.CalculatedShipMethodName.replace(" ","").replace("-","") + ",";
               }
            }
         
         		//events
            omntag.events = "purchase,event67";
            //Sub Total
            var subTotal = _satellite.getVar('Product subtotal');
            if(subTotal){
              if(typeof(subTotal) == "number")
                subTotal = subTotal.toFixed(2);
              omntag.events += ",event114="+subTotal;
            }
            //Promo Code
            var discountTotal = _satellite.getVar('Promo Code Sales');
            if(discountTotal && discountTotal != "0"){
              if(typeof(discountTotal) == "number")
                discountTotal = discountTotal.toFixed(2);
              omntag.events += ",event115="+discountTotal;
            }
            omntag.eVar7 = model.Email;
            omntag.eVar8 = "Checkout";
            omntag.eVar9 = model.Email;
            omntag.eVar16 = model.ErrorMessage;
            omntag.eVar23 = parseFloat(model.OrderSummary.Basket.ShippingGrandTotal).toFixed(2);
            omntag.eVar24 = model.OrderSummary.Basket.MerchandiseSubtotal;
            var payment = "";
         		var altPayment = "";
         		var paymentBreak = "";
            for (var i=0; i < Crate.Model.PaymentInfoForTagging.CreditCards.length; i++) {
            var payment = Crate.Model.PaymentInfoForTagging.CreditCards[i]; 
             switch(payment.AlternativePaymentType){
		
								case 0:
									altPayment = "";
									break;
								case 1: 
                  altPayment = "PayPal - ";
									break;
								case 2: 
                  altPayment = "MasterPass - ";
									break;
		}
              if (omntag.eVar52 === undefined){
                  omntag.eVar52 = "";
                  }
              if (i < Crate.Model.PaymentInfoForTagging.CreditCards.length-1){
                paymentBreak = "; ";
              } 
              else{
                paymentBreak = "";
              }
            omntag.eVar52 += altPayment + payment.CardType + paymentBreak;  

            }
            var storeid = "";
            for (var i=0; i < Crate.Model.DeliveryAndGOpt.ShOptRecipient.length; i++) {
            var storeid = Crate.Model.DeliveryAndGOpt.ShOptRecipient[i];
            omntag.eVar55 = storeid.InStorePickupId;
            }
            omntag.eVar59 = model.OrderSummary.Basket.DiscountCode;
        }
        $(".jsTagCoordinatingItems").each(function (id, elem) {
            var $elem = $(elem);
            var href = $elem.attr("href");
            if (href) {
                href = updateQueryString("rv", omntag.pageName, href);
                $elem.attr("href", href);
            }
        });
        $(".jsTagCustomersAlsoViewed").each(function (id, elem) {
            var $elem = $(elem);
            var href = $elem.attr("href");
            if (href) {
                href = updateQueryString("rv", omntag.pageName, href);
                $elem.attr("href", href);
            }
        });
    }

    
   //Add Cross Sell to s.products
   var crossSell = sessionStorage.getItem('s_crossSell');
   if(crossSell){
     omntag.products += "|eVar110=" + crossSell;
     omntag.eVar44 = crossSell;
     sessionStorage.removeItem('s_crossSell');
   }

    function getDefaultTitle() {
        var title = document.title;
        if (title.indexOf('|') > 0) {
            title = title.split('|')[0];
        }
        return title;
    }
    function walkCategories(Category) {
        var parent = Category.ParentCategory;
        if (parent && parent.Name != "Shop Root" && parent.URLpath != "/xx/") {
            return walkCategories(parent) + ":" + Category.Name;
        }
        return Category.Name;
    }
    function getSuperCategory(Category) {
        var parent = Category.ParentCategory;
        if (parent && parent.Name != "Shop Root" && parent.URLpath != "/xx/") {
            return getSuperCategory(parent);
        }
        return Category;
    }
    function getAvailabilityMessage(statusCode)
    {           
        switch (statusCode)
        {
            case 1:
                return "In Stock";
            case 4:
            case 7:
                return "Limited Quantity";
            case 2:
            case 3:
            case 5:
            case 6:
            case 8:
                return "Back Order";
            case 0:
            case 9:
            case 10:
            case 12:
            case 83:
                return "NLA";
            case 14:
            case 15:
                return "Stock Plus";
            default:
                return "";
        }

        return availabilityMessage;
    }
   function isOnSale(product) {
       if (product.CurrentPrice != product.RegularPrice) {
          return "Sale";
       } else {
          return "Non-Sale";
       }
    }
    function updateQueryString(key, value, url) {
        if (!url) url = window.location.href;
        var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)(.*)", "gi");

        value = encodeURIComponent(value);
        if (re.test(url)) {
            if (typeof value !== 'undefined' && value !== null)
                return url.replace(re, '$1' + key + "=" + value + '$2$3');
            else {
                return url.replace(re, '$1$3').replace(/(&|\?)$/, '');
            }
        }
        else {
            if (typeof value !== 'undefined' && value !== null) {
                var separator = url.indexOf('?') !== -1 ? '&' : '?',
                    hash = url.split('#');
                url = hash[0] + separator + key + '=' + value;
                if (hash[1]) url += '#' + hash[1];
                return url;
            }
            else
                return url;
        }
    }
    function getParameterByName(key) {
        key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + key + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
   function GetPrice(x) {
    if (x) {
        return "" + (x / 100).toFixed(2)
    } else {
        return "0.00"
    }
}
    function tagEvent(eventId) {

        if (omntag) {
            omntag.linkTrackVars = 'events';
            omntag.linkTrackEvents = eventId;
            omntag.events = eventId;
            omntag.tl(this, 'o', 'Name_of_Link');
        }
    }

    if (omntag.t === undefined) omntag.t = function () { };
    //omntag.t();
}

});
