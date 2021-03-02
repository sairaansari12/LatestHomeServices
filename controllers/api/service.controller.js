const express = require('express');
const app = express();
const db = require('../../db/db');
const config = require('config');
const Op = require('sequelize').Op;
const moment = require('moment');
const c = require('config');
const Geo = require('geo-nearby');
var _ = require('underscore');
const { companyId } = require('../../helpers/common');

//Relations
SERVICES.belongsTo(CATEGORY, { as: 'category', foreignKey: 'categoryId' })
SERVICES.belongsTo(FILTERS, {foreignKey: 'itemType' })

SERVICES.belongsTo(COMPANY, { foreignKey: 'companyId' })

SERVICES.hasOne(FAVOURITES, { id: 'id' })
SERVICES.hasOne(CART, { serviceId: 'serviceId' })
COMPANY.hasMany(CATEGORY, { foreignKey: 'companyId' })
COUPAN.belongsTo(COMPANY, { foreignKey: 'companyId' })
SUBORDERS.belongsTo(ORDERS, { foreignKey: 'orderId' })
COMPANY.belongsTo(COUPAN, { foreignKey: 'offer' })
CATEGORY.belongsTo(CATEGORY, { foreignKey: 'parentId' })

//Home API with cats and trending and banners

app.get('/getParentcategories', checkAuth, async (req, res, next) => {
  try {

    //Get All Categories
    const servicesData = await CATEGORY.findAll({
      attributes: ['id', 'name', 'icon', 'thumbnail', 'colorCode'],
      where: {
        status: 1,
        parentId: '0',
        id: { [Op.not]: '0' },

      },


      order: [
        ['orderby', 'ASC']
      ],
    })



    //CART ITEMS CATEGORY
    var cartCategoryType = "", cartCategoryCompany = ""
    var cartData = await CART.findAll({
      where: { userId: req.id },
      include: [
        { model: SERVICES, attributes: ['categoryId'] }
      ]
    });

    for (var p = 0; p < cartData.length; p++) {
      if (cartData[p].service && cartData[p].service.categoryId && cartData[p].service.categoryId != "") {
        var data = await CATEGORY.findOne({
          attributes: ['connectedCat', 'id', 'companyId'],
          where: {
            id: cartData[p].service.categoryId
          }
        });

        cartCategoryType = JSON.parse(JSON.stringify(data.dataValues.connectedCat).toString())
        cartCategoryCompany = data.dataValues.companyId

        break;

      }

    }



    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name', 'url'],
      where: { companyId: req.parentCompany },
      order: [
        ['orderby', 'ASC']
      ],
    })


    let userData = {}

    //Combining Data
    userData.banners = banners
    userData.services = servicesData
    userData.cartCategoryType = cartCategoryType
    userData.cartCategoryCompany = cartCategoryCompany

    var currency = await commonMethods.getCurrency(req.companyId)

    var links = await commonMethods.getLinks(req.parentCompany)


    var termsLink = "", aboutUsLink = "", privacyLink = ""
    if (links && links.dataValues) {
      aboutUsLink = links.dataValues.aboutusLink
      privacyLink = links.dataValues.privacyLink
      termsLink = links.dataValues.termsLink

    }

    userData.aboutUsLink = aboutUsLink
    userData.privacyLink = privacyLink
    userData.termsLink = termsLink



    if (currency && currency.dataValues && currency.dataValues.currency)
      userData.currency = currency.dataValues.currency
    else userData.currency = CURRENCY
    return responseHelper.post(res, appstrings.success, userData);

    //return responseHelper.post(res, appstrings.success,userData);

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }


});

app.get('/getcategories', checkAuth, async (req, res, next) => {
  try {

    var category = req.query
    //Get All Categories
    const servicesData = await CATEGORY.findAll({
      attributes: ['id', 'name', 'icon', 'thumbnail', 'colorCode'],
      where: {
        status: 1,
        level: '1',
        companyId: req.companyId,
        parentId: category,
        id: { [Op.not]: '0' },

      },


      order: [
        ['orderby', 'ASC']
      ],
    })


    //CART ITEMS CATEGORY
    var cartCategoryType = ""
    var cartData = await CART.findAll({
      where: { companyId: req.companyId, userId: req.id },
      include: [
        { model: SERVICES, attributes: ['categoryId'] }
      ]
    });

    for (var p = 0; p < cartData.length; p++) {
      if (cartData[p].service && cartData[p].service.categoryId && cartData[p].service.categoryId != "") {
        var data = await CATEGORY.findOne({
          attributes: ['connectedCat', 'id'],
          where: {
            id: cartData[p].service.categoryId
          }
        });

        cartCategoryType = JSON.parse(data.dataValues.connectedCat).toString()
        break;

      }

    }





    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name', 'url'],
      where: { companyId: req.companyId },
      order: [
        ['orderby', 'ASC']
      ],
    })


    let userData = {}

    //Combining Data
    userData.banners = banners
    userData.services = servicesData
    userData.cartCategoryType = cartCategoryType
    var currency = await commonMethods.getCurrency(req.companyId)
    if (currency && currency.dataValues && currency.dataValues.currency) userData.currency = currency.dataValues.currency
    else userData.currency = CURRENCY
    return responseHelper.post(res, appstrings.success, userData);

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }


});

app.get('/getSubcat', checkAuth, async (req, res, next) => {

  var params = req.query
  var category = ""

  if(params.category)  category = params.category

  var params = req.query
  var dataItem = ['0', '1']

  var subWhere= {
    status: 1,
    companyId: req.companyId,
    level:1

  }

 

  if (params.itemType && params.itemType != "" && params.itemType != "2") 
    dataItem = [params.itemType]
  var include = []
  try {
   

    var newDate = moment(new Date()).format("MM/DD/YYYY");
    const coupanData = await COUPAN.findAll({
      attributes: ['id', 'name', 'description', 'icon', 'thumbnail', 'code', 'discount', 'validupto'],
      where: {
        companyId: req.companyId,
        status: 1,
        validupto: {
          [Op.gte]: newDate
        },
      }
    })



//CATEGORY
 
var catArray=[]
var catListing =  await CATEGORY.findAll({
  attributes: ['id','parentId','name','description','icon','thumbnail','createdAt','status'],
  where: {companyId:[ req.companyId],level:'1',status:1},
  include:[{model:CATEGORY,attributes:['id','name','description','icon','thumbnail','createdAt','status'],where:{status:1}}],
  order: [
    ['name','ASC']
  ],
  
});


var ids=[]

//console.log("?>?>?>?>?>?>?>?>?>>>",JSON.parse(JSON.stringify(catListing)))
for(var h=0;h<catListing.length;h++)
{
if(!ids.includes(catListing[h].category.id)) {catArray.push(catListing[h].category)

  ids.push(catListing[h].category.id)
}
}



if(category!="")
subWhere.parentId=category



else
subWhere.parentId=ids



console.log("SUBWHEEE>>>>>>>>>>>",subWhere)
var services = await CATEGORY.findAll({
  attributes: ['id', 'name', 'description', 'icon', 'thumbnail', 'companyId'],
  where:subWhere,
  include: include,
  order: [
    ['orderby', 'ASC']
  ],
})




    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name', 'url'],
      where: { companyId: req.companyId },
      order: [
        ['orderby', 'ASC']
      ],
    })

    //Rating detail
    const ratingInfo = await COMPANYRATING.findOne({
      attributes: ['rating', 'review', 'orderId', 'foodQuality', 'foodQuantity', 'packingPres'],
      where: {
        userId: req.id,
        companyId: req.companyId,
        [Op.or]: [
          {
            orderId: ""
          },
          {
            orderId: null
          },
          {
            orderId: "null"
          }

        ]
      },
    })

    //COMPANY DETAIL
    const company = await COMPANY.findOne({
      attributes: ['companyName', 'address1', 'email', 'countryCode', 'phoneNumber', 'rating', 'totalRatings', 'logo1', 'startTime', 'endTime', 'deliveryType', 'itemType',
        'foodQuantityRating', 'foodQualityRating', 'packingPresRating', 'latitude', 'longitude'
      ],
      where: { id: req.companyId },
      include: [{ model: DOCUMENT, attributes: ['aboutUs', 'aboutUsLink', 'facebookLink', 'gmailLink', 'twitterLink', 'linkedinLink'] }]

    })

    //Galledry
    var gallery = await GALLERY.findAll({
      attributes: ['id', 'mediaHttpUrl', 'mediaType', 'createdAt', 'title', 'description'],
      where: { mediaType: 'photo', companyId: req.companyId, status: 1 },
      offset: 0, limit: 5,
      order: [['createdAt', 'DESC']]

    });

    let userData = {}

    //Combining Data
    userData.offers = coupanData
    userData.subcat = services
    userData.banners = banners
    userData.details = company
    userData.gallery = gallery
    userData.category = catArray
    userData.ratingInfo = ratingInfo ? ratingInfo : undefined



    
    getTrending(category, dataItem, req.companyId, function (err, data) {

      if (data) userData.trending = data
      else userData.trending = []

      return responseHelper.post(res, appstrings.success, userData);

    })

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});



app.get('/home', checkAuth, async (req, res, next) => {

  var params = req.query

  var lat = 0
  var lng = 0
  var itemType = []
  if (params.itemType && params.itemType != "") itemType = [params.itemType]

  if (params.lat) lat = parseFloat(params.lat)
  if (params.lng) lng = parseInt(params.lng)


  let responseNull = commonMethods.checkParameterMissing([params.deliveryType])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {

    //Offers
    var newDate = moment(new Date()).format("MM/DD/YYYY");
    const offers = await COUPAN.findAll({
      attributes: ['id', 'name', 'icon', 'thumbnail', 'code', 'discount', 'validupto', 'description'],
      include: [{
        model: COMPANY, attributes: ['companyName', 'id'], where: {
          deliveryType: { [Op.or]: [params.deliveryType, 2] },
        }
      }],
      where: {
        status: 1,
        companyId: req.parentCompany,
        validupto: {
          [Op.gte]: newDate
        }
      },
      offset: 0, limit: 5,
    })

    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name', 'url'],
      where: { companyId: req.parentCompany },
      order: [
        ['orderby', 'ASC']
      ],
      offset: 0, limit: 5

    })


    //ALL CATEGORIES

    
    var catListing =  await CATEGORY.findAll({
      attributes: ['id','parentId','name','description','icon','thumbnail','createdAt','status'],
      where: {companyId:[req.parentCompany],level:'0',status:1},
    include:[{model:SERVICES,attributes:['categoryId']}],
    group:['name'],
      order: [
        ['orderby','ASC']
      ],
    });





    const permissions = await PERMISSIONS.findOne({
      where: {
        companyId: req.parentCompany }
    });



    catListing=JSON.parse(JSON.stringify(catListing))
    for(var k=0;k<catListing.length;k++)
    {

if(permissions && permissions.dataValues && permissions.dataValues.pCategories )
{
if( !permissions.dataValues.pCategories.includes(catListing[k].id))
delete catListing[k]
} 
else delete catListing[k]

    
  }

  catListing=  catListing.filter(i => i)











    //Restro Offers
    const restOffers = await COUPAN.findAll({
      attributes: ['discount', 'name','icon', 'thumbnail'],
      where: {
        offerType: 'overall',
        status: 1,
        validupto: {
          [Op.gte]: newDate
        }
      },
      group: ['discount'],
      order: [
        ['discount', 'ASC']
      ],
      offset: 0, limit: 5

    })



    //Vendors
    var vendors = await COMPANY.findAll({
      attributes: [[sequelize.literal("6371 * acos(cos(radians(" + lat + ")) * cos(radians(latitude)) * cos(radians(" + lng + ") - radians(longitude)) + sin(radians(" + lat + ")) * sin(radians(latitude)))"), 'distance'], 'id', 'companyName', 'logo1', 'address1', 'startTime', 'endTime', 'rating', 'tags', 'totalOrders', 'totalOrders24'],
      where: {
        status: 1,
        role: 2,
        parentId: req.parentCompany,
        deliveryType: { [Op.or]: [params.deliveryType, 2] }
        
      },
      include: [{
        model: COUPAN, required: false, attributes: ['discount', 'code', 'validUpto'],
        where: {
          status: 1,
          validupto: {
            [Op.gte]: newDate
          }
        }
      }
      ],

      order: sequelize.col('distance'),
      offset: 0, limit: 30,
    })

    var companyIds = _.map(vendors, function (data) { return data.id; });

    var dataVendor = vendors
    if (dataVendor.length > 8)
      dataVendor = dataVendor.slice(0, 8);
    var bestSeller = _.shuffle(dataVendor);


    //Ratings and best seller



    var topPicks = await getTopPicksItems(req, params.deliveryType, itemType)



    let userData = {}

    //Combining Data
    userData.offers = offers
    userData.banners = banners

    if (vendors.length > 6)
      vendors = vendors.slice(0, 6);

    userData.vendors = vendors
    userData.restOffers = restOffers


    // userData.banners = banners
    if (bestSeller.length > 6)
      bestSeller = bestSeller.slice(0, 6);
    userData.bestSeller = bestSeller
    userData.topPicks = topPicks

    var cartCompanyType = ""
    var cartCount=0
    var cartData = await CART.findAll({
      where: { userId: req.id },
      attributes: ['companyId']
    });
    if (cartData)
    {
       cartCompanyType = cartData.length>0?cartData[0].companyId:""
      cartCount=cartData.length

    }
    userData.cartCompanyType = cartCompanyType
    userData.cartCount = cartCount

    //Recent order

    var recentOrder = await ORDERS.findOne({
      attributes: ['id', 'orderNo', 'progressStatus', 'totalOrderPrice'],
      where: { userId: req.id, progressStatus: [1, 3, 6, 7, 8, 9, 10] },
      include: [{ model: ORDERSTATUS, attributes: ['statusName', 'status'] }],
      order: [
        ['createdAt', 'DESC']],

    });





//COMAPNY

var lpReferral1=0
var lpReferral2=0
var currency=CURRENCY
var companyData = await COMPANY.findOne({
  attributes: ['id', 'deliveryType',],
  where: { id: req.parentCompany},
  include:[{model:DOCUMENT,attributes:['id','lpReferral1','lpReferral2','currency']}]
});

if(companyData && companyData.dataValues &&  companyData.dataValues.document){
  lpReferral1=companyData.dataValues.document.lpReferral1
  lpReferral2=companyData.dataValues.document.lpReferral2
  currency=companyData.dataValues.document.currency
}


userData.lpReferral1=lpReferral1
userData.lpReferral2=lpReferral2
userData.currency=currency

    //Comleted Order
    var empData = await getRecentComletedOrder(req.id)



    userData.recentOrder = recentOrder
    userData.completedorder = empData
    userData.detailsFilled = req.userData.detailsFilled
  userData.catListing=catListing

    getTrendingDeliveryType(params.deliveryType, companyIds, itemType, req.parentCompany,async function (err, data) {

      if (data) userData.trending = data
      else userData.trending = []

      var cartData=await updateCart(req.id,params.deliveryType,cartCount,cartCompanyType)
if(cartData==200)
      return responseHelper.post(res, appstrings.success, userData);
else
return responseHelper.post(res, appstrings.success, userData,205);

    })



  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});

app.get('/homeVendor', checkAuth, async (req, res, next) => {

  var params = req.query

  var lat = 0
  var lng = 0
  var itemType = ['0', '1', '2']
  if (params.itemType && params.itemType != "") itemType = [params.itemType, '2']

  if (params.lat) lat = parseFloat(params.lat)
  if (params.lng) lng = parseInt(params.lng)


  let responseNull = commonMethods.checkParameterMissing([params.deliveryType])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  try {

    //Offers
    var newDate = moment(new Date()).format("MM/DD/YYYY");
    const offers = await COUPAN.findAll({
      attributes: ['id', 'name', 'icon', 'thumbnail', 'code', 'discount', 'validupto', 'description'],
      include: [{
        model: COMPANY, attributes: ['companyName', 'id'], where: {
          deliveryType: { [Op.or]: [params.deliveryType, 2] },
        }
      }],
      where: {
        status: 1,
        companyId: req.parentCompany,
        validupto: {
          [Op.gte]: newDate
        }
      },
      offset: 0, limit: 5,
    })

    //Banners
    const banners = await BANNERS.findAll({
      attributes: ['name', 'url'],
      where: { companyId: req.parentCompany },
      order: [
        ['orderby', 'ASC']
      ],
      offset: 0, limit: 5

    })



    //Restro Offers
    const restOffers = await COUPAN.findAll({
      attributes: ['discount', 'name','icon', 'thumbnail'],
      where: {
        offerType: 'overall',
        status: 1,
        validupto: {
          [Op.gte]: newDate
        }
      },
      group: ['discount'],
      order: [
        ['discount', 'ASC']
      ],
      offset: 0, limit: 5

    })



    //Cat lsiting

      
    var catListing =  await CATEGORY.findAll({
      attributes: ['id','parentId','name','description','icon','thumbnail','createdAt','status'],
      where: {companyId:[req.parentCompany],level:'0',status:1},
    include:[{model:SERVICES,attributes:['categoryId']}],
    group:['name'],
      order: [
        ['orderby','ASC']
      ],
    });

 
    



    var topPicks = await getTopPicksItems(req, params.deliveryType, itemType)
    var suggested = await getSuggested(req)



    let userData = {}

    //Combining Data
    userData.offers = offers
    userData.banners = banners
    userData.restOffers = restOffers
    userData.topPicks = topPicks
    userData.suggested = suggested
    userData.currency = CURRENCY
    userData.detailsFilled = req.userData.detailsFilled
   userData.catListing=catListing



    var cartCompanyType = ""
    var cartCount=0
    var cartData = await CART.findAll({
      where: { userId: req.id },
      attributes: ['companyId']
    });
    if (cartData)
    {
       cartCompanyType = cartData.length>0?cartData[0].companyId:""
      cartCount=cartData.length

    }
    userData.cartCompanyType = cartCompanyType
    userData.cartCount = cartCount



//COMAPNY

var deliveryType=1
var lpReferral1=0
var lpReferral2=0
var companyData = await COMPANY.findOne({
  attributes: ['id', 'deliveryType',],
  where: { id: req.parentCompany},
  include:[{model:DOCUMENT,attributes:['id','lpReferral1','lpReferral2']}]
});

if(companyData && companyData.dataValues) deliveryType=companyData.dataValues.deliveryType
if(companyData && companyData.dataValues &&  companyData.dataValues.document){
  
  
  lpReferral1=companyData.dataValues.document.lpReferral1
  lpReferral2=companyData.dataValues.document.lpReferral2

}


   userData.deliveryType=deliveryType
   userData.lpReferral1=lpReferral1
   userData.lpReferral2=lpReferral2

    //Recent order

    var recentOrder = await ORDERS.findOne({
      attributes: ['id', 'orderNo', 'progressStatus', 'totalOrderPrice'],
      where: { userId: req.id, progressStatus: [1, 3, 6, 7, 8, 9, 10] },
      include: [{ model: ORDERSTATUS, attributes: ['statusName', 'status'] }],
      order: [
        ['createdAt', 'DESC']],

    });

    //Comleted Order
    var empData = await getRecentComletedOrder(req.id)



    userData.recentOrder = (recentOrder)?recentOrder:undefined
    userData.completedorder = empData


    getTrendingDeliveryType(params.deliveryType, [req.parentCompany], itemType, req.parentCompany,function (err, data) {

      if (data) userData.trending = data
      else userData.trending = []

       updateCart(req.id,params.deliveryType)

      return responseHelper.post(res, appstrings.success, userData);
    })



  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});







app.get('/getServices', checkAuth, async (req, res, next) => {

  var params = req.query
  var page = 1
  var limit = 20
  var categoryId = params.category

  var dataItem = []

  if (params.itemType && params.itemType != "" ) dataItem = [params.itemType]



  if (params.page) page = params.page
  if (params.limit) limit = parseInt(params.limit)
  var offset = (page - 1) * limit
  var catArray = [categoryId]
  var include = []


  include = [{
    model: CATEGORY,
    as: 'category',
    attributes: ['id', 'name', 'icon', 'thumbnail'],
    required: true
  },

  {
    model: FAVOURITES,
    where: {
      'userId': req.id,

    },
    attributes: ['id'],
    required: false,
  },

  {
    model: CART,
    where: {
      'userId': req.id,
    },
    attributes: ['id', 'quantity', 'orderPrice', 'orderTotalPrice'],
    required: false,
  },

  {
    model: FILTERS,
    attributes: ['id', 'filter'],
  }

  ]

  try {


   

    var catDta = await CATEGORY.findAll({
      attributes: ['id', 'name', 'description', 'icon', 'thumbnail','connectedCat','level'],
      where: {
        parentId: categoryId,
        status: 1
      },
      order: [
        ['orderby', 'ASC']
      ],
    })




    var catLevel=await CATEGORY.findOne({
      attributes: ['id','level'],
      where: {id:categoryId}});

      // if(catLevel)
      // {
        var level=catLevel.dataValues.level
        var catId=await CATEGORY.findAll({
          attributes: ['id'],
          where: {level:{[Op.gte]:level},status:1,connectedCat : {[Op.like]: '%' + categoryId + '%'}}});
  
         if(catId.length>0) catArray=catId.map(user => user.id);

      //}

    //   else{
    // for (var p = 0; p < catDta.length; p++) {
    //   catArray.push(catDta[p].id)
     
    // }
  //}

 // console.log("CAT ARRAY>>>>>>>>>>",catArray)

    var services = await SERVICES.findAll({
      attributes: ['id', 'name', 'description', 'productType', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration', 'includedServices', 'excludedServices', 'originalPrice', 'offer', 'offerName', 'validUpto', 'itemType','unit'],
      where: {
        categoryId: { [Op.or]: catArray },
        status: 1,
        deleted:0,
        itemType: { [Op.or]: dataItem }

      },
      include: include,
      order: [
        ['orderby', 'ASC']
      ],
      offset: offset, limit: limit
    })

    services = JSON.parse(JSON.stringify(services))
    for (var p = 0; p < services.length; p++) {

      //  if(services[p].cart) services[p].cart=services[p].cart.id
      //  else services[p].cart=""

      if (services[p].favourite) services[p].favourite = services[p].favourite.id
      else services[p].favourite = ''

      if (services[p].offer > 0 && (new Date(services[p].validUpto) < new Date())) {
        services[p].price = parseFloat(services[p].originalPrice)
        services[p].offer = 0
      }

      services[p].price=parseFloat(services[p].price)
      services[p].originalPrice=parseFloat(services[p].originalPrice)


    }
    var filters=[]

    filters=getFilters=await commonMethods.getFilters(req.parentCompany,categoryId)


    let dataSend = {};
    dataSend.services = services
    dataSend.headers = catDta
    dataSend.filters = filters

    return responseHelper.post(res, appstrings.success, dataSend);



  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});


app.post('/search', checkAuth, async (req, res, next) => {

  var params = req.body

  var search = params.search
  var type = params.type
  let responseNull = commonMethods.checkParameterMissing([search])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);

  var page = 1
  var limit = 20
  if (params.page) page = params.page
  if (params.limit) limit = parseInt(params.limit)
  var offset = (page - 1) * limit


  var lat = 0
  var lng = 0
  if (params.lat) lat = parseFloat(params.lat)
  if (params.lng) lng = parseInt(params.lng)



  var include = [{
    model: CATEGORY,
    as: 'category',
    where:{status:1},
    attributes: ['id', 'name', 'icon', 'thumbnail'],
    required: true
  },

  {
    model: FAVOURITES,
    where: {
      'userId': req.id,

    },
    attributes: ['id'],
    required: false,
  },



  {
    model: COMPANY,
    where: {
      deliveryType: { [Op.or]: [params.deliveryType, 2] },
    },
    attributes: ['id', 'companyName', 'rating'],
    required: true,
  },


  {
    model: CART,
    where: {
      'userId': req.id,
    },
    attributes: ['id'],
    required: false,
  }



  ]

  try {
    var services = [];
      services = await SERVICES.findAll({
        attributes: ['id', 'name', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration', 'includedServices', 'excludedServices', 'originalPrice', 'offer', 'offerName', 'validUpto', 'itemType','rating','totalRatings','unit'],
        where: {
          name: { [Op.like]: '%' + search + '%' },
          parentCompany:req.parentCompany,

          status: 1,
          deleted:0,
        },
        include: include,
        order: [
          ['orderby', 'ASC']
        ],
        offset: offset, limit: limit,

      })

      services = JSON.parse(JSON.stringify(services))
      for (var p = 0; p < services.length; p++) {

        if (services[p].cart) services[p].cart = services[p].cart.id
        else services[p].cart = ""

        if (services[p].favourite) services[p].favourite = services[p].favourite.id
        else services[p].favourite = ''

        if (services[p].offer > 0 && (new Date(services[p].validUpto) < new Date())) {
          services[p].price = parseFloat(services[p].originalPrice)
          services[p].offer = 0
        }

      }


    


      //Vendors
      var newDate = moment(new Date()).format("MM/DD/YYYY");
      var vendors = await COMPANY.findAll({
        attributes: [[sequelize.literal("6371 * acos(cos(radians(" + lat + ")) * cos(radians(latitude)) * cos(radians(" + lng + ") - radians(longitude)) + sin(radians(" + lat + ")) * sin(radians(latitude)))"), 'distance'], 'id', 'companyName', 'logo1', 'address1', 'startTime', 'endTime', 'rating'],
        where: {
          status: 1,
          role: 2,
          parentId: req.parentCompany,
          companyName: { [Op.like]: '%' + search + '%' },
          deliveryType: { [Op.or]: [params.deliveryType, 2] }
        },
        include: [{
          model: COUPAN, required: false, attributes: ['discount', 'code', 'validUpto'],
          where: {
            status: 1,
            validupto: {
              [Op.gte]: newDate
            }
          }
        }
        ],
        order: sequelize.col('distance'),
        offset: offset, limit: limit,
      })


    //CATEGPORIES

    var catListing =  await CATEGORY.findAll({
      attributes: ['id','parentId','name','description','icon','thumbnail','createdAt','status'],
      where: {companyId:[req.parentCompany],level:'0', name: { [Op.like]: '%' + search + '%' },status:1},
      order: [
        ['name','ASC']
      ],
    });









    let dataSend = {};
    dataSend.services = services
    dataSend.vendors = vendors
    dataSend.category = catListing

    return responseHelper.post(res, appstrings.success, dataSend);



  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});

app.get('/detail', checkAuth, async (req, res, next) => {
  var id = req.query.serviceId
  let responseNull = commonMethods.checkParameterMissing([id])
  if (responseNull) return responseHelper.post(res, appstrings.required_field, null, 400);
  try {
    var services = await SERVICES.findOne({
      attributes: ['id', 'name', 'description', 'price', 'icon', 'thumbnail', 'type', 'price', 'duration', 'includedServices', 'excludedServices', 'rating', 'originalPrice', 'offer', 'offerName', 'itemType','unit'],
      where: {
        id: id,
        status: 1
      },

      include: [{
        model: FAVOURITES,
        where: {
          'userId': req.id,

        },
        attributes: ['id'],
        required: false,
      },

      {
        model: CART,
        where: {
          'userId': req.id,
        },
        attributes: ['id'],
        required: false,
      },
      {
        model: CATEGORY,
        as: 'category',
        attributes: ['id', 'name', 'icon', 'thumbnail'],
        required: true
      },




      ],


      order: [
        ['orderby', 'ASC']
      ],
    })
    if (services) {

      services = JSON.parse(JSON.stringify(services))

      var rating = 0

      if (services.cart) services.cart = services.cart.id
      else services.cart = ""

      if (services.favourite) services.favourite = services.favourite.id
      else services.favourite = ''
      // services['category']=null

      if (services.offer > 0 && (new Date(services.validUpto) < new Date())) {
        services.price = parseFloat(services.originalPrice)
        services.offer = 0
      }


      return responseHelper.post(res, appstrings.success, services);

    }
    else return responseHelper.post(res, appstrings.no_record, null, 204);

  }
  catch (e) {
    return responseHelper.error(res, e.message, 400);
  }

});

async function getTrending(CAT, dataItem, companyId,callback) {
  var where = {status:1}
  if (CAT != "")
    where.connectedCat = {
      [Op.like]: '%' + CAT + '%'

    }

  try {

    var services = await SERVICES.findAll({
      attributes: ['id', 'name', 'productType', 'popularity', 'description', 'icon', 'thumbnail', 'categoryId', 'itemType','rating','totalRatings','unit'],
      where: {
        status: 1,
        deleted:0,
        companyId:companyId,
        productType: 1
      },
      include: [{
        model: CATEGORY,
        as: 'category',
        attributes: ['name', 'id'],
        required: true,
        where: where

      },
      {
        model: FILTERS,
        attributes: ['id', 'filter'],
      }
    
    
    ],
      order: [['popularity', 'DESC']],
      offset: 0, limit: 10,

    })

    if (services) callback(null, services);
    else callback(appstrings.oops_something, services)

  }

  catch (e) {
    console.log(e)
    callback(e.message, null);

  }



}



async function getRecentComletedOrder(userId) {


  var empData = {}
  var completedtOrder = await ORDERS.findOne({
    attributes: ['id', 'companyId','serviceDateTime','orderNo','totalOrderPrice'],
    where: { userId: userId, progressStatus: [5], userShow: 0 },
    include: [{
      model: ASSIGNMENT, required: true, attributes: ['empId'],
      include: [{ model: EMPLOYEE, attributes: ['firstName', 'lastName', 'phoneNumber', 'image'] }],

    },
    { model: ADDRESS, attributes: ['id', 'addressName', 'addressType', 'houseNo', 'city'] },

  
  
  ],
  });



  if (completedtOrder && completedtOrder.dataValues && completedtOrder.dataValues.assignedEmployees.length > 0) {
    empData.empId = completedtOrder.dataValues.assignedEmployees[0].empId
    empData.companyId = completedtOrder.dataValues.companyId
    empData.orderId = completedtOrder.dataValues.id
    var empDetails = completedtOrder.dataValues.assignedEmployees[0].employee
    empData.firstName = empDetails.firstName
    empData.lastName = empDetails.lastName
    empData.image = empDetails.image
    empData.serviceDateTime = completedtOrder.dataValues.serviceDateTime
    empData.orderNo = completedtOrder.dataValues.orderNo
    empData.totalOrderPrice = completedtOrder.dataValues.totalOrderPrice
    empData.address = completedtOrder.dataValues.address.addressName

    
    ORDERS.update({ userShow: 1 }, { where: { id: completedtOrder.dataValues.id } });

  }

  return empData



}

async function getTrendingDeliveryType(deliveryType, companyIds, itemType, parentCompany,callback) {



  try {

    var services = await SERVICES.findAll({
      attributes: ['id', 'name', 'description', 'popularity', 'icon', 'thumbnail', 'categoryId', 'rating', 'itemType','companyId','unit'],
      where: {
        status: 1,
        deleted:0,
        productType:1
      },
      include: [
        {
          model: COMPANY, attributes: ['id'], required: true,
          where: {
            deliveryType: { [Op.or]: [deliveryType, 2] },
            id: { [Op.or]: companyIds },
          }
        },
        {
          model: FILTERS,
          attributes: ['id', 'filter'],
        },

        {
          model: CATEGORY,
          as: 'category',
          where:{status:1},
          attributes: ['name', 'id'],
          required: true
        }

      ],
    
      order: [['popularity', 'DESC']],
      offset: 0, limit: 10,


    })



   if (services.length<2)
    {

      services = await SERVICES.findAll({
    attributes: ['id', 'name', 'description', 'popularity', 'icon', 'thumbnail', 'categoryId', 'rating', 'itemType','companyId','unit'],
    where: {
      status: 1,
      deleted:0,
      productType:1,
      parentCompany: parentCompany,

    },
    include: [
      {
        model: COMPANY, attributes: ['id'], required: true,
        where: {
          deliveryType: { [Op.or]: [deliveryType, 2] },
        }
      },
      {
        model: FILTERS,
        attributes: ['id', 'filter'],
      },

      {
        model: CATEGORY,
        as: 'category',
        where:{status:1},
        attributes: ['name', 'id'],
        required: true
      }

    ],
  
    order: [['popularity', 'DESC']],
    offset: 0, limit: 10,


  })

    }

    if (services) callback(null, services);
    else callback(appstrings.oops_something, services)

  }

  catch (e) {
    console.log(e)
    callback(e.message, null);

  }



}




async function getTopPicks(req, deliveryType, itemType) {


  try {

    var countDataq = await ORDERS.findAll({
      attributes: ["id", "companyId", [sequelize.fn("COUNT", sequelize.col("companyId")), "count"]],
      group: ['companyId'],
      where: { userId: req.id },
      include: [{
        model: COMPANY,
        attributes: ['id'],
        where: {
          deliveryType: { [Op.or]: [deliveryType, 2] },
          itemType: { [Op.or]: itemType }

        }
      }
      ],

      order: [[sequelize.literal('count'), 'DESC']],
      offset: 0, limit: 5,
    });

    var companyArray = []
    for (var k = 0; k < countDataq.length; k++) {
      companyArray.push(countDataq[k].companyId)
    }


    var where = {
      status: 1,
      role: 2,
      parentId: req.parentCompany
    }
    if (companyArray && companyArray.length > 0)
      where.id = { [Op.or]: companyArray }
    else return [];






    var vendors = await COMPANY.findAll({
      attributes: ['id', 'companyName', 'logo1', 'address1', 'rating'],
      where: where,
      offset: 0, limit: 5,
    })


    return vendors;

  }

  catch (e) {
    console.log(e)
    return [];

  }



}



async function getTopPicksItems(req, deliveryType, itemType) {


  try {

    var countDataq = await SUBORDERS.findAll({
      attributes: ["id", "serviceId", [sequelize.fn("COUNT", sequelize.col("serviceId")), "count"]],
      group: ['serviceId'],
      where: { userId: req.id },
      include:{model:SERVICES,attributes:['id'],where:{productType:1}},
      order: [[sequelize.literal('count'), 'DESC']],
      offset: 0, limit: 5,
    });

    var companyArray = []
    for (var k = 0; k < countDataq.length; k++) {
      companyArray.push(countDataq[k].serviceId)
    }


    var where = {
      status: 1,
      deleted:0,
    }
    if (companyArray && companyArray.length > 0)
      where.id = { [Op.or]: companyArray}
    else return [];






    var vendors = await SERVICES.findAll({
      attributes: ['id','name','icon','thumbnail','validUpto','offer','offerName','price','originalPrice','rating','totalRatings','companyId','unit'],
      where: where,
      include:[{
        model: FILTERS,
        attributes: ['id', 'filter'],
      }],
      offset: 0, limit: 10,
    })

    

    return vendors;

  }

  catch (e) {
    console.log(e)
    return [];

  }



}




async function getSuggested(req) {


  try {

    var countDataq = await SUBORDERS.findAll({
      attributes: ["id", "serviceId"],
      include:[{model:SERVICES, attributes:['id','categoryId'],required:true}],
      where: { userId: req.id},
      group:['serviceId'],
      offset: 0, limit: 5,
    });


    
    var companyArray = []
    var serviceIds = []

    for (var k = 0; k < countDataq.length; k++) {
      if(!companyArray.includes(countDataq[k].service.categoryId)) companyArray.push(countDataq[k].service.categoryId)
     if(!serviceIds.includes(countDataq[k].serviceId))  serviceIds.push(countDataq[k].serviceId)

    }




    var where = {
      status: 1,
      productType:1,
      parentCompany:req.parentCompany
    }
    if (companyArray && companyArray.length > 0)
     { where.categoryId = { [Op.or]: companyArray }
      where.id = { [Op.not]: serviceIds },
      where.categoryId={[Op.not]: '0'},
      where.status= 1,
      where.productType=1
      where.parentCompany=req.parentCompany
     }
      




    var vendors = await SERVICES.findAll({
      attributes: ['id','name','categoryId','icon','thumbnail','validUpto','offer','offerName','price','originalPrice','rating','totalRatings','unit'],
      where: where,
      include:[{
        model: FILTERS,
        attributes: ['id', 'filter'],
      }],
      offset: 0, limit: 10,
    })


    if(vendors.length==0)
    {

     
      
      var vendors = await SERVICES.findAll({
        attributes: ['id','name','categoryId','icon','thumbnail','validUpto','offer','offerName','price','originalPrice','rating','totalRatings','unit'],
        where:  {
          
          categoryId :{ [Op.or]: companyArray },
        categoryId:{[Op.not]: '0'},
        productType:1,
        status:1,
        deleted:0,
        parentCompany:req.parentCompany
    
    },
include:[{
  model: FILTERS,
  attributes: ['id', 'filter'],
}],

        offset: 0, limit: 10,
      })


    }

    return vendors;

  }

  catch (e) {
    console.log(e)
    return [];

  }

 


}
 async function updateCart(userId,deliveryType,cartCount,cartCompanyId)
{

 




  if(cartCount>0)
  {

 //Vendors
 var vendors = await COMPANY.findOne({
  attributes: ['id'],
  where: {
    id: cartCompanyId,
    deliveryType: { [Op.or]: [deliveryType, 2] }
    
  },

})


if(vendors)
{CART.update({deliveryType:deliveryType},{where:{userId:userId}})
return 200

}
else return 205
  }
else return 200;


}


module.exports = app;