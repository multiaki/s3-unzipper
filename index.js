const AWS = require("aws-sdk");
const unzipper = require("unzipper");

const filePath = "newfile.csv";
const bucketName = "aws-zipfolder";
const key = "newfile.csv.zip";

AWS.config.update({ region: "us-east-1" });
let s3 = new AWS.S3();

let index = 0;
function streamToS3(body) {
  console.log(index++);
  return s3.upload({ Bucket: bucketName, Key: filePath, Body: body }).promise();
}

const downloadFile = async (filePath, bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  };
  const body = s3
    .getObject(params)
    .createReadStream()
    .on("error", e => {
      console.log(e);
    })
    .pipe(unzipper.ParseOne(filePath, { forceStream: true }))
    .on("end", () => {
      console.log("end");
    });

  let result =  await streamToS3(body)

  let message = {
    Message: JSON.stringify({ Bucket: bucketName, Key: filePath }),
    TopicArn: "<YOUR-TOPIC-ARN>"
  };

  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(message)
    .promise();

  return publishTextPromise;
};

downloadFile(filePath, bucketName, key).then(
  () => console.log("done"),
  e => console.log("error", e)
); // Body can be a stream here;
