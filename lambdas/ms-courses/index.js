const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    console.log("EVENTO");
    console.log(event);
    let routeKey = event.httpMethod + ' '+event.resource;
    console.log(routeKey);
    switch (routeKey) {
      case "DELETE /courses/{id}":
        await dynamo
          .delete({
            TableName: "upc-dev-courses",
            Key: {
              id: parseInt(event.pathParameters.id)
            }
          })
          .promise();
        body = `Deleted course ${event.pathParameters.id}`;
        break;
      case "GET /courses/{id}":
        console.log("get resources");
        console.log("ID: "+event.pathParameters.id)
        body = await dynamo
          .get({
            TableName: "upc-dev-courses",
            Key: {
              id: parseInt(event.pathParameters.id)
            }
          })
          .promise();
        break;
      case "GET /courses":
        body = await dynamo.scan({ TableName: "upc-dev-courses" }).promise();
        break;
      case "PUT /courses":
        console.log("put");
        let requestJSON = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: "upc-dev-courses",
            Item: {
              id: requestJSON.id,
              name: requestJSON.name,
              credits: requestJSON.credits,
              hours: requestJSON.hours,
              school: requestJSON.school,
              alumns: requestJSON.alumns
            }
          })
          .promise();
        body = `Put course ${requestJSON.id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};
