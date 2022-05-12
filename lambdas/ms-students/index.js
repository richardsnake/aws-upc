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
      case "DELETE /students/{id}":
        await dynamo
          .delete({
            TableName: "upc-dev-students",
            Key: {
              dni: event.pathParameters.id
            }
          })
          .promise();
        body = `Deleted students ${event.pathParameters.id}`;
        break;
      case "GET /students/{id}":
        console.log("get resources");
        console.log("ID: "+event.pathParameters.id)
        body = await dynamo
          .get({
            TableName: "upc-dev-students",
            Key: {
              dni: event.pathParameters.id
            }
          })
          .promise();
        break;
      case "GET /students":
        body = await dynamo.scan({ TableName: "upc-dev-students" }).promise();
        break;
      case "PUT /students":
        console.log("put");
        let requestJSON = JSON.parse(event.body);
        //let requestJSON = event.body;
        await dynamo
          .put({
            TableName: "upc-dev-students",
            Item: {
              dni: requestJSON.dni,
              names: requestJSON.names,
              lastname: requestJSON.lastname,
              sex: requestJSON.sex,
              birthday: requestJSON.birthday
            }
          })
          .promise();
        body = `Put students ${requestJSON.dni}`;
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
