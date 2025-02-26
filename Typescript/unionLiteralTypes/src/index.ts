// import { Expect,Equal } from '@type-challenges/utils';
export function validateUsername(username: string | null): boolean {
    if(typeof username==="string"){
        return username.length > 5 
    }
    return false
  }



// const appElement = document.getElementById('app')
// if (!appElement) {
//     throw new Error("null")
// }
// type Test = Expect<Equal<typeof appElement, HTMLElement>>


type APIResponse =
  | {
      data: {
        id: string
      }
    }
  | {
      error: string
    }
export const handleResponse = (response: APIResponse) => {
  if ('data' in response) {
    return response.data.id
  } else {
    throw new Error(response.error)
  }
}


type Direction="up"|"down"|"left"|"right"
export function move(direction:Direction, distance: number) {
    // Move the specified distance in the given direction
    if(direction === 'up' || direction === 'down' || direction === 'left' || direction === 'right'){
        return direction + distance
    } else {
        throw new Error('error')
    }
}


export const somethingDangerous = () => {
    if (Math.random() > 0.5) {
      throw new Error('Something went wrong')
    }
  
    return 'all good'
  }


  try {
    somethingDangerous()
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
    }else throw error
  }


  export const parseValue = (value: unknown) => {
    if (typeof value === 'object' &&
        value !== null &&
        'data' in value &&
        typeof value.data === 'object' &&
        value.data !== null &&
        'id' in value.data &&
        typeof value.data.id === 'string') {
      return value.data.id
    }
  
    throw new Error('Parsing error!')
  }

  