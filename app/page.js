'use client'

import {Box, Stack, Typography, Button, Modal, TextField}  from '@mui/material'
import {firestore} from '../firebase'
import {collection, doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc} from 'firebase/firestore'
import { useEffect, useState} from 'react'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};


export default function Home() {
const [pantry, setPantry] = useState([])
const [open, setOpen] = useState(false);
const handleOpen = () => setOpen(true);
const handleClose = () => setOpen(false);
const [itemName, setItemName] = useState('')
const [searchOpen, setSearchOpen] = useState(false);
const [searchInput, setSearchInput] = useState('');
const [searchResult, setSearchResult] = useState(null);
const [searchPerformed, setSearchPerformed] = useState(false);


const handleSearchOpen = () => {
  setSearchInput('');
  setSearchResult(null);
  setSearchPerformed(false);
  setSearchOpen(true);
};

const handleSearchClose = () => {
  setSearchInput('');
  setSearchResult(null);
  setSearchPerformed(false);
  setSearchOpen(false);
};

const handleSearch = async () => {
  setSearchPerformed(true);
  const result = await searchForItem(searchInput);
  setSearchResult(result);
};


const updatePantry = async () => {
  const snapshot = query(collection(firestore, 'pantry'))
  const docs = await getDocs(snapshot)
  const pantryList = []
   docs.forEach(doc => {
     pantryList.push({name: doc.id, ...doc.data()})
   })
   console.log(pantryList)
   setPantry(pantryList)
 }

  useEffect (() => {
  updatePantry()
  }, [])

const addItem = async (item) => {
  const docRef = doc(collection(firestore, 'pantry'), item)
  // Check if item exists
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    const count = docSnap.data().count
    await setDoc(docRef, {count: count + 1})
  }
  else{
    await setDoc(docRef, {count: 1})
  }
  await updatePantry()
 }

const RemoveItem = async(item) => {
  const docRef = doc(collection(firestore, 'pantry'), item)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    const {count} = docSnap.data()
    if (count === 1) {
      await deleteDoc(docRef)
    }
    else{
      await setDoc(docRef, {count: count - 1})
    }
}
    await updatePantry()
}

const searchForItem = async (item) => {
  const docRef = doc(collection(firestore, 'pantry'), item);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

  return (
  <Box width="100vw" height = "100vh"display={"flex"} flexDirection={"column"}justifyContent={"center"} alignItems={"center"} gap={2}>
  
  <Modal
  open={open}
  onClose={handleClose}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box sx ={style}>
    <Typography id="modal-modal-title" variant="h6" component="h2">
      Add Item
    </Typography>
    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
    </Typography>

    <Stack width = {'100%'} direction = {'row'} spacing ={2}>
    <TextField id="outlined-basic" label="Item" variant="outlined" fullWidth value={itemName} onChange={(e) => setItemName(e.target.value)}/>
    <Button variant="outlined" 
    onClick = {() =>  {
      addItem(itemName)
      setItemName('')
      handleClose()
  }}>
     Add
    </Button>
    </Stack>

  </Box>
</Modal>


<Modal
        open={searchOpen}
        onClose={handleSearchClose}
        aria-labelledby="search-modal-title"
        aria-describedby="search-modal-description"
      >
        <Box sx ={style}>
          <Typography id="search-modal-title" variant="h6" component="h2">
            Search Item
          </Typography>
          <TextField
            fullWidth
            label="Item Name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
          {searchPerformed && (
            searchResult !== null ? (
            <Box display = {'flex'} flex-direction={'row'} justifyContent={'center'} gap = {'20px'}>
            <Typography id="search-modal-description" sx={{ mt: 2, fontSize: '1rem' }}>
              {`Item Count: ${searchResult.count}`}
            </Typography>
            <Box display = {'flex'} flex-direction={'row'} justifyContent={'center'} gap = {'5px'}>
            <Button variant="contained"   sx={{ mt: 1.5, width: '5px', height: '30px', fontSize: '0.86rem' }} onClick={() => {addItem(searchInput); handleSearchClose();}}> Add </Button>
            <Button variant="contained" sx={{ mt: 1.5, width: '5px', height: '30px', fontSize: '0.86rem' }} onClick={() => {RemoveItem(searchInput); handleSearchClose();}}> Delete </Button>
              </Box>
              </Box>

          ) : (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <Typography id="search-modal-description" sx={{ mr: 2 }}>
            Item not found
          </Typography>
          <Button variant="contained" onClick={() => {addItem(searchInput); handleSearchClose();}}>
            Add
          </Button>
        </Box>
              
          )
          )}
        </Box>
      </Modal>




  <Box width = '1000px' height = '60px' bgcolor = '#ADD8E6' display={'flex'} flex-direction={'row'} justifyContent={'center'}  gap ={'35px'} alignItems={'center'} >
  <Button variant = "contained" onClick={handleOpen}> 
    Add Item
  </Button>

  <Button variant = "contained" onClick={handleSearchOpen}> 
    Search for Item
  </Button>
  </Box>

  <Box border = {'1px solid #333'}>
  <Box width = '1000px' height = '100px' bgcolor = '#ADD8E6' display={'flex'} justifyContent={'center'} alignItems={'center'} > 
    <Typography variant = {'h2'} color = {'#333'} textAlign = {'center'}>
    Pantry Items
    </Typography>
    
  </Box> 

    <Stack width = "1000px" height = "500px" spacing = {2} overflow = "auto">
      
      {pantry.map(({name, count}) => (
          <Box  key={name} width = "100%" minHeight = "150px" display = "flex" justifyContent = "space-between" alignItems = "center" bgcolor = '#f0f0f0' paddingX = {5}>
        <Typography variant = "h3" color = {'#333'} textAlign = {'center'} >
        {        // Capitalize the first letter of the item 
          name.charAt(0).toUpperCase() + name.slice(1)
        }
        </Typography>

        <Typography variant = {"h3"} color = {'#333'} textAlign = {'center'} >
          Quantity: {count}
          </Typography>

        <Box display = {'flex'} flex-direction={'row'} justifyContent={'center'} gap = {'7px'}>
        <Button variant = "contained" onClick = {() => addItem(name)}>Add</Button>
        <Button variant = "contained" onClick = {() => RemoveItem(name)}>Remove</Button>
        </Box>

        </Box>
     ))}
    </Stack>
    </Box>
  </Box>
)
}
