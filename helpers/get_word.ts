
import randomWord from 'npm:random-word'

// TODO - get all the words from the datastore to make sure they are unique. 
// Or don't, not sure. there is 274,925 words, not sure how many after removing 3 letter words.
export function getWord(): string {
  let word = randomWord()
  while (word.length < 4) {
    word = randomWord()
  }
  return word
}