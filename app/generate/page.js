'use client'

import { useState } from 'react'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText
} from '@mui/material'
import { doc, collection, getDoc, writeBatch } from 'firebase/firestore';

export default function Generate() {
  const [text, setText] = useState('') // the question from the response
  const [flashcards, setFlashcards] = useState([]); // the frontend and the backend of my flashcards

  const [setName, setSetName] = useState(''); // generate a name for a set of flashcards
  const [dialogOpen, setDialogOpen] = useState(false); // use the command to control my dialogue's action
 
  const handleSubmit = async() => {
      if(!text.trim()) {
        // check whether the user types the input
        alert('Please enter some text to generate flashcards');
        return;
      }
      try {
         // fetch the response from a specific api with the following two properties:
         //  (1) method    (2) body 
         const response = await fetch('api/generate', {
            method: 'POST',
            body: text,
         })

         // check if the response is fetched successfully. If not, throw an error
         if (!response.ok) {
            throw new Error('failed to generate the flashcards');
         }

         // convert my response into json format
         const data = await response.json();
         
         // set my flashcards
         setFlashcards(data);
      }catch(error) {
        console.error('Error generating flashcards: ', error);
        alert('An error occurred while generating the flashcards');
      }
  };

  const handleOpenDialogue = () => {
     setDialogOpen(true);
  }

  const handleCloseDialogue = () => {
     setDialogOpen(false);
  }

  // save the flashcard to the firebase
  const savedFlashcards = async() => {
      if (!setName.trim()) {
        alert('Please Enter your name for a flashcard set!');
        return;
      }
      try{
          const userDocRef = doc(collection(db, 'users'), user.id); // initiialize db from the firestore
          const userDocSnap = await getDoc(userDocRef); // retrieve the data from a specific document reference

          const batch = writeBatch(db); // perform multiple operations as a single atomic operation

          
          if (userDocSnap.exists()) {
            /* What happen if the document referenced by userDocSnap actually exists? */
            const userData = userDocSnap.data(); // obtain a specific data
            
            // use the spread  operator to create a new array
            // ... -> the items placed at the original array
            // (1) If the flashcardSet exists, it can be formatted as [...userData.flashcardSets]
            // (2) Otherwise, it can be written as [...[]]
            // (3) The criterion is the name itself.
            const updateSets = [...(userData.flashcardSets || []), {name: setName}]
            
            // update my set using userDocRef above
            batch.update(userDocRef, {flashcardSets: updateSets}); 
          }
          else {
            // create a new flashcard set using batch.set() method
            batch.set(userDocRef, {flashcardSets: [{name: setName}]});
          }

          // save the flashcards to a new set
          const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setName);
          batch.set(setDocRef, {flashcards});

          await batch.commit();

          alert('Flashcards are saved successfully!');
          handleCloseDialogue();
          setSetName('');
      }catch(error) {
        console.error('Error saving flashcards', error);
        alert('An error occurred while saving flashcards. Please try again!');
      }
  }
  

  return (
    
    <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
            Generate Flashcards
            </Typography>
            <TextField 
            value={text}
            onChange={(e) => setText(e.target.val)}
            label = "Enter Text"
            fullWidth
            multilane
            rows = {4}
            variant = "outlined"
            sx = {{ mb: 2}}
            />
            <Button 
            variant='contained'
            color='primary'
            onClick={handleSubmit}
            fullWidth
            >
            Generate Flashcards           
            </Button>
        </Box>
        
        
        {
        // Generate the flashcard one by one
        flashcards.length > 0 && 
         <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterbottom>
                  Generated Flashcards
            </Typography>
            {flashcards.map((flashcard, index) => (
               <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                       <CardContent>
                           <Typography variant='h6'> Front: </Typography>
                           <Typography> {flashcard.front} </Typography>
                           <Typography variant='h6'> Back: </Typography>
                           <Typography> {flashcard.back} </Typography>
                       </CardContent>
                    </Card>
               </Grid>
            ))}
         </Box>
        }

        {
            // include the functionality of saving any cards you want
            flashcards.length > 0 &&
            <Box sx={{mt: 4, display: 'flex', justifyContent: 'center'}}>
                <Button variant='contained' color='primary' onClick={handleOpenDialogue}>
                     Save Flashcards
                </Button>
            </Box>
            
        }

        {
            // include the functionality of saving a flashcard set by adding the dialog component 
            // for naming and saving the flashcard set
            <Dialog open={handleOpenDialogue} onClose={handleCloseDialogue}>
                 <DialogTitle> Saved Flashcards </DialogTitle>
                 <DialogContent>
                      <DialogContentText> Please enter a name for your flashcard set </DialogContentText>
                      <TextField 
                        autoFocus
                        margin='dense'
                        label='Set Name'
                        type='text'
                        fullWidth
                        value={setName}
                        onChange={(e) => setSetName(e.target.val)}
                      />
                 </DialogContent>
                 <DialogActions>
                    <Button variant='contained' onClick={handleCloseDialogue}> Closed </Button>
                    <Button variant='contained' onClick={savedFlashcards} color='primary'> Saved </Button>
                 </DialogActions>
            </Dialog>
        }      
    </Container>
  )
}

