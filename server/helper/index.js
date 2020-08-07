const connectRetry = async (maxRetries, clientObj) => {
  try {
    return await clientObj.connect();
  } catch (err) {
    if (maxRetries === 1) throw err;
    return await connectRetry(maxRetries - 1, clientObj);
  }
};

const getCurrentDate = () => {
  const dt = new Date();
  let currentDateString = "";
  currentDateString += dt.getFullYear() + "-";
  currentDateString +=
    (dt.getMonth() > 8 ? dt.getMonth() + 1 : "0" + (dt.getMonth() + 1)) + "-";
  currentDateString +=
    (dt.getDate() > 9 ? dt.getDate() : "0" + dt.getDate()) + " ";
  currentDateString +=
    (dt.getHours() > 9 ? dt.getHours() : "0" + dt.getHours()) + ":";
  currentDateString +=
    (dt.getMinutes() > 9 ? dt.getMinutes() : "0" + dt.getMinutes()) + ":";
  currentDateString +=
    dt.getSeconds() > 9 ? dt.getSeconds() : "0" + dt.getSeconds();

  return currentDateString;
};

module.exports = {
  connectRetry,
  getCurrentDate,
};
