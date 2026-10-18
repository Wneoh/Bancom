const crypto=require('crypto');
exports.validate=body=>['test-card','test-bank','test-wallet'].includes(body.paymentMethod) && ['success','declined'].includes(body.paymentOutcome);
exports.receipt=body=>({mode:'simulation',status:'succeeded',method:body.paymentMethod,reference:'SIM-'+crypto.randomBytes(8).toString('hex').toUpperCase(),paidAt:new Date().toISOString()});
