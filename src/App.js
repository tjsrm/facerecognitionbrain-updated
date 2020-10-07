import React,{Component} from 'react';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import ErrorMsg from './components/ErrorMsg/ErrorMsg'
import Particles from 'react-particles-js'


import './App.css';



const particleOptions ={

                particles: {
                  number:{
                    value:30,
                    density:{
                      enable:true,
                      value_area:800
                    }
                  }
                }
            
             
}
const initialstate={
  input:'',
  errMsg: false,
    imageUrl:'',
    box: {},
    route:'Signin',
    isSignedIn: false,
    user:{
      id: '',
      name: '',
      email:'',
      password:'',
      entries:0,
      joined: ''
    }

}
class App extends Component {
constructor(){
  super();
  this.state= initialstate;
}
loadUser = (data) => {
  this.setState({user:{
      id: data.id,
      name: data.name,
      email:data.email,
      password:data.password,
      entries:data.entries,
      joined: data.joined,
    }

  })
}

calculateFaceLocation =(data) =>{
const clarifaiFace=data.outputs[0].data.regions[0].region_info.bounding_box;
const image=document.getElementById('inputimage')
const width= Number(image.width)
const height=Number(image.height)

return {
  leftCol :clarifaiFace.left_col  * width,
  topRow :clarifaiFace.top_row * height,
  rightCol: width -(clarifaiFace.right_col * width),
  bottomRow:height -(clarifaiFace.bottom_row * height)
}
}


displayFaceBox =(box) =>{
 
  this.setState({box:box});
}
onInputChange= (event) =>{
  const searchString =event.target.value
 const pattern = new RegExp(["http://"])
 const pattern1 = new RegExp(["https://"])
  if (pattern.test(searchString) ||pattern1.test(searchString)  ){
    
  this.setState({input: event.target.value});
  this.setState({errMsg: false})
   }
  else{
    
    this.setState({errMsg: true})
  }
 
}

OnButtonSubmit =() => {

  this.setState({imageUrl: this.state.input})

 
 if(!this.state.errMsg ) {
    

  fetch('https://gentle-woodland-89010.herokuapp.com/imageurl'
    /*"http://localhost:3001/imageurl"*/,{
                  method:'post',
                  headers:{'Content-Type':'application/json'},
                  body:JSON.stringify({
                      input:this.state.input     

                    })
                  })
  .then(response => response.json())
  .then( (response) => {
 
        if (response){
            fetch('https://gentle-woodland-89010.herokuapp.com/image'
              /*"http://localhost:3001/image"*/,{
                  method:'put',
                  headers:{'Content-Type':'application/json'},
                  body:JSON.stringify({
                      id:this.state.user.id     

                                    })
                                              }).then(response => response.json())
                                                .then(count => {
                                                    this.setState(Object.assign(this.state.user,{entries:count}))
                                                                })
                                                                  .catch(console.log)  

          
        }
        this.displayFaceBox( this.calculateFaceLocation(response) )
})
.catch((err) => {
 console.log(err);
});
this.setState({route: 'home'})
}
else{
  this.setState({route: 'error'})
}



}


onRouteChange=(route)=>{
  if(route === 'Signout'){
    this.setState(initialstate)
  }else if(route === 'home'){
   this.setState({isSignedIn: true})
  }
  this.setState({route:route})
}

  render(){

      const {isSignedIn,imageUrl,route,box,errMsg} = this.state ;

      return (
          <div className="App">
                  <Particles className='particles'
                  params={particleOptions}/>



         <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {
        route === 'home'
         ?<div>
                

               
              

                <Logo/>
                <Rank name={this.state.user.name} entries={this.state.user.entries}/>
               
                <ImageLinkForm 
                onInputChange={this.onInputChange} 
                OnButtonSubmit={this.OnButtonSubmit}/>
                <FaceRecognition box= {box} imageUrl={imageUrl}/>
          </div>
          
          :(
            route=== 'Signin'
            )
          ?<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :   (
           route === 'error' 
            )
          ?<div>
              <ErrorMsg />   
              <Logo/>
                <Rank name={this.state.user.name} entries={this.state.user.entries}/>
               
                <ImageLinkForm 
                onInputChange={this.onInputChange} 
                OnButtonSubmit={this.OnButtonSubmit}/>
                <FaceRecognition box= {box} imageUrl={imageUrl}/>
          </div>

          :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
           
          
          
           



        }


    
   
      
       </div> );
      }
        

  }

 
export default App;