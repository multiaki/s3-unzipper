const AWS = require("aws-sdk");
const unzipper = require("unzipper");

const filePath = "newfile.csv";
const bucketName = "aws-zipfolder";
const key = "newfile.csv.zip";

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

  return await streamToS3(body)
};

downloadFile(filePath, bucketName, key).then(
  () => console.log("done"),
  e => console.log("error", e)
); // Body can be a stream here;
