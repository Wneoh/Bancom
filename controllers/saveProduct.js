const Product = require('../models/product');

function handler(editing) {
  return async (req, res, next) => {
    let product;
    const json = req.get('accept')?.includes('application/json');
    const fields = {
      name: String(req.body.product_name || '').trim(),
      brand: String(req.body.product_brand || '').trim(),
      price: Number(req.body.product_price),
      catagory: req.body.product_catagory,
      description: String(req.body.product_description || '').trim(),
      specs: String(req.body.product_specs || '').trim()
    };
    function fail(message) {
      if (json) return res.status(422).json({message});
      return res.status(422).render(editing ? 'edit_product' : 'add_product', {
        title: editing ? 'Edit Product' : 'Add Product', pId: req.body.pId,
        product: {...fields, image: product ? product.image : []},
        error: message + ' Please select any new files again.', csrfToken: req.csrfToken(),
        role: req.session.role, loggedIn: req.session.loggedIn, user: req.session.user
      });
    }
    try {
      try { fields.tags=require('../services/collectionTags').parse(req.body.product_tags || ''); } catch(error) {return fail(error.message);}
      product = editing ? await Product.findById(req.body.pId) : new Product();
      if (!product) return res.status(404).json({message: 'Product no longer exists.'});
      if (req.uploadError) return fail(req.uploadError);
      if (fields.name.length < 5 || fields.name.length > 50) return fail('Product name must contain 5–50 characters.');
      if (!fields.brand || fields.brand.length > 50) return fail('Brand must contain 1–50 characters.');
      if (!Number.isFinite(fields.price) || fields.price < 1 || fields.price > 20000) return fail('Price must be between RM 1 and RM 20,000.');
      if (!['phone','computer','camera','headphone','gaming','wearable'].includes(fields.catagory)) return fail('Choose a valid category.');
      if ([fields.description,fields.specs].some(text => text.length < 20 || text.length > 2000)) return fail('Description and specifications must each contain 20–2,000 characters.');
      const files = req.files || [];
      const uploaded = [];
      for (const file of files) {
        const png = file.buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
        const jpeg = file.buffer[0] === 255 && file.buffer[1] === 216 && file.buffer[2] === 255;
        if (!png && !jpeg) return fail('A selected file is not a valid JPG or PNG image.');
        uploaded.push({name:file.originalname, contentType:png ? 'image/png' : 'image/jpeg', data:file.buffer.toString('base64')});
      }
      const existing = product.image || [];
      let order;
      try {
        order = req.body.image_order ? JSON.parse(req.body.image_order) : [...existing.map((_,i)=>`existing:${i}`), ...uploaded.map((_,i)=>`new:${i}`)];
      } catch (_) { return fail('Invalid image selection. Reload the editor and try again.'); }
      if (!Array.isArray(order) || order.length < 1 || order.length > 6 || new Set(order).size !== order.length) return fail('Keep between 1 and 6 images.');
      const images = [];
      for (const key of order) {
        if (typeof key !== 'string' || !/^(existing|new):\d+$/.test(key)) return fail('Invalid image selection.');
        const [type,index] = key.split(':');
        const image = (type === 'existing' ? existing : uploaded)[Number(index)];
        if (!image) return fail('An image is missing. Reload the editor and try again.');
        images.push(image);
      }
      Object.assign(product, fields, {image:images});
      await product.save();
      const url = '/pDetail?pid=' + product._id;
      return json ? res.json({url}) : res.redirect(url);
    } catch (error) { next(error); }
  };
}
exports.add = handler(false);
exports.edit = handler(true);
