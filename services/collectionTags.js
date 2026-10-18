exports.parse=value=>{
 if(typeof value!=='string')throw new Error('Enter collection tags separated by commas.');
 const tags=[...new Set(value.split(',').map(tag=>tag.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase()).filter(Boolean))];
 if(tags.length>8 || tags.some(tag=>tag.length>32))throw new Error('Use up to 8 collection tags, each no longer than 32 characters.');
 return tags;
};
