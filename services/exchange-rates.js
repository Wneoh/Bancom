const quotes = ['SGD', 'USD', 'EUR', 'GBP', 'JPY'];
const sourceUrl = 'https://api.frankfurter.dev/v2/providers/ecb/rates?base=MYR&quotes=' + quotes.join(',');
let cached, pending, retryAfter = 0;
async function getRates() {
  if (cached && Date.now() - cached.fetchedAt < 3600000) return {...cached, stale:false};
  if (Date.now() < retryAfter) {
    if (cached) return {...cached, stale:true};
    throw new Error('Rates temporarily unavailable');
  }
  if (!pending) pending = (async () => {
    try {
      const response = await fetch(sourceUrl, {signal:AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error('Rate provider unavailable');
      const rows = await response.json();
      const rates = {MYR:1}, dates = {};
      for (const quote of quotes) {
        const row = Array.isArray(rows) && rows.find(row=>row.base==='MYR' && row.quote===quote);
        if (!row || !Number.isFinite(row.rate) || row.rate<=0 || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw new Error('Invalid rate data');
        rates[quote]=row.rate; dates[quote]=row.date;
      }
      cached = {base:'MYR',rates,dates,fetchedAt:Date.now(),source:'European Central Bank via Frankfurter',sourceUrl};
      return {...cached,stale:false};
    } catch (error) {
      retryAfter=Date.now()+60000;
      if (cached) return {...cached,stale:true};
      throw error;
    } finally { pending=null; }
  })();
  return pending;
}
module.exports = {getRates};
