const connectRetry = async (maxRetries, clientObj) => {
  try {
    return await clientObj.connect();
  } catch (err) {
    if (maxRetries === 1) throw err;
    return await connectRetry(maxRetries - 1, clientObj);
  }
};

module.exports = {
  connectRetry,
};
