import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import {readFile} from 'fs';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  
  // Root Endpoint
  // Displays a simple message to the user
  const imageMatcher = /image\/w+/;

  app.get( "/", async ( req, res ) => {
    res.send(`try GET /filteredimage?image_url={{}}\r\nPort=${port}`)
  });

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  app.get("/filteredimage", async (req, res) => {
    const imageUrl = req.query.image_url;

    if(! imageUrl) return res.status(400).send({ auth: false, message: 'Image url is missing'});

    var imagePath:string;

    try
    {
      imagePath = await filterImageFromURL(imageUrl as string);
    }
    catch(ex)
    {
      res.status(400).send({auth: false, message: 'Url does not refer to an image'});
      return;
    }

    readFile(imagePath, async (err, content) => {  
      await deleteLocalFiles([imagePath]);

      if(err || content === null) {
        res.status(400).send({auth: false, message: 'File was not found'});
      }

      res.set('Content-Type', 'image/jpeg');
      res.end(content);
      res.status(200).send();
    });
  });  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();