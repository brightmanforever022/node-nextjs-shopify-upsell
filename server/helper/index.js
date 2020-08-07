const connectRetry = async (maxRetries, clientObj) => {
  try {
    return await clientObj.connect();
  } catch (err) {
    if (maxRetries === 1) throw err;
    return await connectRetry(maxRetries - 1, clientObj);
  }
};

const getCurrentDate = () => {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    d.getUTCMonth() +
    "-" +
    d.getDay() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds()
  );
};

module.exports = {
  connectRetry,
  getCurrentDate,
};
