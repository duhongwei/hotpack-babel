# hotpack-babel

babel  plugin for [hotpack](https://github.com/duhongwei/hotpack)

## usage

```js
import  babel from '@duhongwei/hotpack-babel'
export default {
  plugin: [
    {
      name: "babel",
      use:babel,
      //opt is optional
      opt:{
        targets:(file,hotpack)=>{
            //if mobile page
            if(file.key.startsWith('h5')){
              return  {
                "Chrome >= 49"
              }
            }
            else{
              return {
                "Chrome >= 32"
              }
            }
        },
        polyfill:(file,hoatpack)=>{
          //if mobile page
          if(file.key.startsWith('h5')){
              return  {
                false
              }
            }
            else{
              return {
                true
              }
            }
        }
      } 
    }
  ]
};
```

### targets option
targets is a function which has two parameters,file and hotpack.  file is current file,hotpack is current Hotpack instanse

by default babel read targets from package.json 

targets example:
```json
   targets: {
      "edge": "17",
      "firefox": "60",
      "chrome": "67",
      "safari": "11.1",
   }
```

```json
"browserslist": [
    "Chrome >= 49"
 ],
```
### polyfill function
pollyfill is a function which has two parameters,file and hotpack.  file is current file,hotpack is current Hotpack instanse

by default pollyfill would be added to every page,and in a single group.
when published,regenerator-runtime.js and corejs.js will be bundled into a single js seperated from others.

you can use the whole pollyfill or not use the pollyfill at all
          
### use babel.config.js

if you need more configuration,add babel.config.js at root path

[help](https://babeljs.io/docs/en/usage/)
