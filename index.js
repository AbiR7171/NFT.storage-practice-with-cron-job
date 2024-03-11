const express = require('express')
const cron = require('node-cron');
const multer  = require('multer');
const { NFTStorage, File } = require('nft.storage');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const crypto = require("crypto")
const fs = require("fs")
const cors = require("cors");
const { generateKeyPairSync, publicEncrypt }=require("crypto")
const app = express()
const port = 5000


const clients = new NFTStorage({token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEQ4NThBQjg2NjkxZTFFNUE5OUI3MjlDOTcxMzU2YzY0RDRkNzdBMDUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwOTc4Njg5MTk2MCwibmFtZSI6InRlc3QifQ.I5EGHz5UK1MNQ6_0SueuWpsO34QHXDYCi4v3T6IOLqc"})



app.use(cors())
app.use(express.json())
app.use(express.static(__dirname + "/uploads"));

// test-server
// kXOF0Uf4IoPFLMW0


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null,  uniqueSuffix + file.originalname)
    }
  })


  const upload = multer({storage: storage});



  

// const uri = "mongodb+srv://test-server:kXOF0Uf4IoPFLMW0@cluster0.hmmbger.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const url = "mongodb://0.0.0.0:27017"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection


    const userDatabase = client.db("test-server").collection("user");
    const  uploadInformationDatabase = client.db("test-server").collection("upload");



    app.post("/create-user", async(req,res)=>{
             const user= req.body;
             const {publicKey, privateKey} = generateKeyPairSync("rsa", {
                modulusLength:2048,
                publicKeyEncoding: {
                   type:"spki",
                   format:"pem"
                },
                privateKeyEncoding:{
                  type:"pkcs8",
                  format:"pem"
                }
             });
             const userInfo = {
              ...user,
              publicKey,
              privateKey
             }
             console.log(publicKey, "=> public", privateKey);
             console.log(userInfo, "=> userInfo");
             const result = await userDatabase.insertOne(userInfo);
             res.send(result)
    })









    
  app.post("/upload-files/:id", upload.fields([{name:"image"}, {name:"video"}]), async(req, res)=>{
    
    try{

      const userId = req.params ;
      console.log(req.files["video"].length);

      if(req.files["image"]?.length === 0 || req.files["video"]?.length === 0){
         throw new Error("Must have to single video and image")
      }

      const updateInformation = {
          userId: userId?.id,
          image: req?.files["image"][0]?.filename,
          video: req?.files["video"][0]?.filename,
          isUpload: false
      }
      
      const upload  = await uploadInformationDatabase.insertOne(updateInformation);
      if(upload){
         console.log("Upload  completed");
      }
    res.send(upload)  
    }catch(err){
       console.log(err);
    }
})
 const handleUploadInNFT = async(uploadInfo) =>{
    try{
      console.log(uploadInfo.userId );

      const userInfo = await userDatabase.findOne({ _id: new ObjectId(uploadInfo.userId)} )
      console.log(userInfo, "user");

      const imageType = uploadInfo?.image?.split(".")
      const videoType = uploadInfo?.video?.split(".")
      const imageBuffer = fs.readFileSync("uploads/" + uploadInfo?.image);
      const image = new File([imageBuffer], uploadInfo?.image, {type: imageType});
      const imageCID = await clients.storeDirectory([image]);
 
      console.log(imageCID, "image");
      const videoBuffer = fs.readFileSync("uploads/"+ uploadInfo?.video);
      const video =  new File([videoBuffer],  uploadInfo?.video, {type: videoType});
      const videoCID = await clients.storeDirectory([video]);

  
      
      const json = {
       "name" : "Video test shfw #14", 
       "description" : "Dummy", 
       "attributes" : [
           {
               "trait_type" : publicEncrypt({key:userInfo.publicKey, padding:crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Face")).toString("base64"), 
               "value" : publicEncrypt({key:userInfo.publicKey, padding:crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Black")).toString("base64")
           }, 
           {
               "trait_type" :publicEncrypt({key:userInfo.publicKey, padding:crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Mouth")).toString("base64"), 
               "value" : publicEncrypt({key:userInfo.publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Round")).toString("base64")
           }, 
           {
               "trait_type" :publicEncrypt({key:userInfo.publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Hat")).toString("base64"), 
               "value" : publicEncrypt({key:userInfo.publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Green")).toString("base64")
           }, 
           {
               "trait_type" :publicEncrypt({key:userInfo.publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Eye")).toString("base64"), 
               "value" :publicEncrypt({key:userInfo.publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Brown")).toString("base64")
           }, 
           {
               "trait_type" :publicEncrypt({key:userInfo.publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Shoes")).toString("base64"), 
               "value" : publicEncrypt({key:userInfo.publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash:"sha256"}, Buffer.from("Black")).toString("base64")
           }
       ], 
       "creators" : [
  
       ], 
       "collection" : {
           "name" : "Video test shfw", 
           "family" : ""
       }, 
       "symbol" : "Vtn", 
       "seller_fee_basis_points" : "NumberInt(0)", 
       "animation_url" : `https://alchemy.mypinata.cloud/ipfs/${videoCID}/${uploadInfo.video}`, 
       "image" :`https://alchemy.mypinata.cloud/ipfs/${imageCID}/${uploadInfo.image}`, 
       "compiler" : "HQNFTs.ai"
  }
  console.log(json);
  const stringifyJson = JSON.stringify(json)
  const jsonFIleObject= new File([Buffer.from(stringifyJson)], "1.json", {type: "application/json"});
  const  jsonCID = await clients.storeDirectory([jsonFIleObject]) 
  console.log(jsonCID, "json");
   const result  = await uploadInformationDatabase.updateOne(
    {_id: uploadInfo._id },
    {$set: {isUpload: true}}
   )
   console.log(result);

   const findImage = await uploadInformationDatabase.find({image: uploadInfo.image, isUpload: false}).toArray();
   const findVideo = await uploadInformationDatabase.find({video: uploadInfo.video, isUpload: false}).toArray();

   if(findImage.length === 0){
     fs.unlinkSync("uploads/" + uploadInfo?.image)
   }
   console.log(findImage, "findImage");

   if(!findVideo.length === 0){
    fs.unlinkSync("uploads/" + uploadInfo?.video)
   }

  

   console.log(videoCID, "video");

    }catch(err){
      console.log(err);
    }
 }


cron.schedule("*/1 * * * *  ", async ()=>{
  console.log("run");
    try{
      const findFalseArray = await uploadInformationDatabase.find({"isUpload": false}).toArray();
      if(findFalseArray){
         findFalseArray?.map( findFalse => handleUploadInNFT(findFalse))
      }
     
 
      console.log(findFalseArray);
    }catch(err){
      console.log(err);
    } 
})









    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





  










app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})