import { useUser } from '@clerk/nextjs'; // authentication
import { useState } from 'react'; // manage the flashcards state
import { useRouter } from 'next/router'; // navigation
import { useSearchParams } from 'next/navigation';  // search for the specific content of a card based on the id
import { doc, collection, getDoc, setDoc} from 'firebase/firestore';
import { Container, Grid, Card, CardActionArea } from '@mui/material';

export async function Flashcard() {
    // The breakdown of its key components can be mentioned as follows.
    const [isLoaded, isSignedIn, user] = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState({});

    const searchParams = useSearchParams();
    const search = searchParams.get('id'); 


    const router = useRouter();

    // The component uses a 'useEffect' hook to fetch the user's flashcard sets
    // when the component mounts or when the user changes.  
    useEffect(()=> {
       async function getFlashcards() {
          if (!search || !user) {
            return;
          }
          const docRef = collection(doc(collection(db, 'users'), user.id), search);
          const docs = await getDoc(docRef);

          const flashcards = [];
          docs.forEach((doc) => {
            flashcards.push({id: doc.id, ...doc.data()});
          })
          setFlashcards(flashcards);
        }
        getFlashcards();
    }, [search, user]);


    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev, 
            [id]: !prev[id],
        }))
        
    }

    return (
       <Container maxWidth="md">
          <Grid container spacing={3} sx={{ mt: 4}}>
             {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardActionArea onClick={() => handleCardClick(flashcard.id)}>
                        <CardContent>
                            {/* <Typography variant='h5' component='div'>{flashcard.name}</Typography> */}
                            <Box>
                                <div>
                                    <Typography variant='h5' component='div'>
                                        {flashcard.front}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant='h5' component='div'>
                                        {flashcard.back}
                                    </Typography>
                                </div>
                            </Box>
                        </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>  
             ))}
          </Grid>
       </Container>
    )
}