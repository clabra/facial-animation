import React, { Component } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { darkBg, darkFocus, darkFont, lightBg, lightFont, lightFocus, visemeMap } from '../Config.js'


class Model extends Component {
  constructor(props) {
    super(props)
    this.state = {
        animationStatus: this.props.animationStatus,
        intensity: this.props.sliderValue,
        theme: this.props.theme,
    }
    this.visemes = undefined
    this.visemesNames = undefined

    this.bgColor = undefined
    this.fontColor = undefined
    this.focusColor = undefined
    this.hemiIntensity = undefined
    this.spotIntensity = undefined

    this.move = 0.02
    this.delta = 0

    this.modelControlActive = false

    this.currentFrame = 1

    this.lidMove = 0.08
    this.lidSpeed = 0.08
    this.lidWait = 1

    this.exponent = 6

    this.obamaRatio = [0.8, 0.8]

    this.dhi = 1.1
    this.dsi = 0.75
    this.lhi = 0.85
    this.lsi = 0.25

    this.start = this.start.bind(this)
    this.animate = this.animate.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
    this.addCube = this.addCube.bind(this)
    this.addModel = this.addModel.bind(this)
    this.getMouthControl = this.getModelControl.bind(this)
    this.moveLid = this.moveLid.bind(this)
    this.nextViseme = this.nextViseme.bind(this)
    this.resetModel = this.resetModel.bind(this)
    this.moveLights = this.moveLights.bind(this)
  }

  componentDidMount() {
    if(this.state.theme === "dark"){
        this.bgColor = darkBg
        this.fontColor = darkFont
        this.focusColor = darkFocus
        this.hemiIntensity = this.dhi
        this.spotIntensity = this.dsi
    }
    else{
        this.bgColor = lightBg
        this.fontColor = lightFont
        this.focusColor = lightFocus
        this.hemiIntensity = this.lhi
        this.spotIntensity = this.lsi
    }
    const width = window.innerWidth
    const height = window.innerHeight

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.renderer = new THREE.WebGLRenderer({ antialias: true , alpha:true})

    this.hemiLight = new THREE.HemisphereLight(this.bgColor, this.focusColor, this.hemiIntensity);
    this.scene.add(this.hemiLight)

    this.spotLight = new THREE.PointLight(this.fontColor, this.spotIntensity);
    this.spotLight.position.set(-80,100,10);
    this.spotLight.castShadow = true;
    this.scene.add(this.spotLight)

    const sphere = new THREE.SphereBufferGeometry( 0.1, 16, 8 );

    this.light1 = new THREE.PointLight( 0xFFFFFF, 0.1, 50 );
    this.light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: this.fontColor } ) ) );
    this.scene.add( this.light1 );

    this.light2 = new THREE.PointLight( 0xFF715B, 0.1, 50 );
    this.light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: this.fontColor } ) ) );
    this.scene.add( this.light2 );

    this.light3 = new THREE.PointLight( 0x1EA896, 0.1, 50 );
    this.light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: this.fontColor } ) ) );
    this.scene.add( this.light3 );

    this.light4 = new THREE.PointLight( this.focusColor, 0.1, 50 );
    this.light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: this.fontColor } ) ) );
    this.scene.add( this.light4 );

    this.light5 = new THREE.PointLight( this.fontColor, 0.1, 50 );
    this.light5.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: this.fontColor } ) ) );
    this.scene.add( this.light5 );

    this.addModel()

    this.camera.position.z = 0.5
    this.camera.position.y = 0

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    // this.renderer.setClearColor('#ffffff')
    this.renderer.setSize(width, height)

    window.addEventListener('resize', this.onWindowResize, false);

    this.mount.appendChild(this.renderer.domElement)

    this.start()
  }

  componentDidUpdate(prevProps){
      if(prevProps.animationStatus !== this.props.animationStatus){
          this.setState({
              animationStatus: this.props.animationStatus
          })
      }
      if(prevProps.visemes !== this.props.visemes){
        this.visemes = this.props.visemes
        this.visemesNames = [...new Set(this.props.visemes)]
        this.currentFrame = 1
        console.log(this.visemes)
        console.log(this.visemesNames)
    }
    if(prevProps.sliderValue !== this.props.sliderValue){
      this.setState({
        intensity: this.props.sliderValue
      })
    }
    if(prevProps.theme !== this.props.theme){
      this.setState({
        theme: this.props.theme
      }, () =>
      {
        console.log(this.state.theme)
        if(this.state.theme === "dark"){
          this.bgColor = darkBg
          this.fontColor = darkFont
          this.focusColor = darkFocus
          this.hemiIntensity = this.dhi
          this.spotIntensity = this.dsi
      }
      else{
          this.bgColor = lightBg
          this.fontColor = lightFont
          this.focusColor = lightFocus
          this.hemiIntensity = this.lhi
          this.spotIntensity = this.lsi
      }
        this.hemiLight.color = new THREE.Color(this.bgColor)
        this.hemiLight.groundColor = new THREE.Color(this.focusColor)
        this.hemiLight.intensity = this.hemiIntensity

        this.spotLight.color = new THREE.Color(this.fontColor)
        this.spotLight.intensity = this.spotIntensity

        this.light1.children[0].material.color = new THREE.Color(this.fontColor)

        this.light2.children[0].material.color = new THREE.Color(this.fontColor)

        this.light3.children[0].material.color = new THREE.Color(this.fontColor)

        this.light4.children[0].material.color = new THREE.Color(this.fontColor)
        this.light4.color = new THREE.Color(this.focusColor)

        this.light5.children[0].material.color = new THREE.Color(this.fontColor)
        this.light5.color = new THREE.Color(this.fontColor)

        this.model.traverse(o => {
          if (o.isMesh && (o.name === 'head' || o.name === 'eye4' || o.name === 'eye4001')) {
            if(this.state.theme === "dark"){
              o.material.emissive = new THREE.Color(this.bgColor)
              o.material.shininess = 150
            }
            else{
              o.material.emissive = new THREE.Color("#000000")
              o.material.shininess = 50
            }
          }
        })

      })
      }
    
  }
  


  addCube(x, y, z) {
    var geometry = new THREE.BoxGeometry(.1,.1,.1)
    geometry.translate(x, y, z)
    var material = new THREE.MeshBasicMaterial({ color: '#433F81' })
    var cube = new THREE.Mesh(geometry, material)
    this.scene.add(cube)
  }

  addModel() {
    var loader = new GLTFLoader();

    loader.load('model/head_new_visemes_2.gltf', gltf => {
      this.model = SkeletonUtils.clone(gltf.scene)
      console.log(this.model)
      this.scene.add(this.model)
      this.getModelControl()
      this.model.traverse(o => {
        // if(o.name === 'eye4001')
        //   o.material.transparent = true
        if (o.isMesh && (o.name === 'head' || o.name === 'eye4' || o.name === 'eye4001')) {
          var newMaterial;
          if(this.state.theme === "dark"){
            newMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 150 } );
            newMaterial.emissive = new THREE.Color(this.bgColor)
          }
          else{
            newMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 50 } );
          }
          newMaterial.needsUpdate = true;
          newMaterial.skinning = o.material.skinning;
          newMaterial.morphTargets = o.material.morphTargets;
          newMaterial.morphNormals = o.material.morphNormals;
          o.material = newMaterial
        }
      })
      this.renderScene()
      this.props.mounted()
      console.log(this.model)
    }, undefined, function (error) {
      console.error(error);
    }
    )
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

  }

  componentWillUnmount() {
    this.mount.removeChild(this.renderer.domElement)
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }


  getModelControl() {
    if (this.model) {
      this.model.traverse(o => {
        if (o.isMesh && o.name === 'head') {
          this.modelControl = o.morphTargetInfluences;
          this.modelControlDict = o.morphTargetDictionary;
          this.modelControlActive = true
        }
      })
    }
  }


  calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
  }


  moveLid(){
    if(this.modelControl){
    if(this.modelControl[this.modelControlDict['wink']] <= 0){
      if (this.lidWait > 400){
        this.lidMove = this.lidSpeed;
        this.lidWait = 0
      }
      else {
        this.lidMove = 0
      }
      this.lidWait += 1
    }
    else if (this.modelControl[this.modelControlDict['wink']] > 1) {
      this.lidMove = -this.lidMove;
    }
    this.modelControl[this.modelControlDict['wink']] += this.lidMove;
  }
  }

  moveLights(){
    const time = Date.now() * 0.0005;

    this.light1.position.x = Math.sin( time * 0.7 ) * 10;
    this.light1.position.y = Math.cos( time * 0.5 ) * 20;
    this.light1.position.z = Math.cos( time * 0.3 ) * 10;

    this.light2.position.x = Math.cos( time * 0.3 ) * 10;
    this.light2.position.y = Math.sin( time * 0.5 ) * 20;
    this.light2.position.z = Math.sin( time * 0.7 ) * 10;

    this.light3.position.x = Math.sin( time * 0.7 ) * 10;
    this.light3.position.y = Math.cos( time * 0.3 ) * 20;
    this.light3.position.z = Math.sin( time * 0.5 ) * 10;

    this.light4.position.x = Math.cos( time * 0.3 ) * 10;
    this.light4.position.y = Math.cos( time * 0.7 ) * 20;
    this.light4.position.z = Math.sin( time * 0.5 ) * 10;

    this.light5.position.x = Math.cos( time * 0.3 ) * 10;
    this.light5.position.y = Math.sin( time * 0.7 ) * 20;
    this.light5.position.z = Math.cos( time * 0.5 ) * 10;
  }

  // nextViseme(){
  //   if(this.currentFrame < 1)
  //     this.currentFrame = 1

  //   var currViseme = this.visemes[this.currentFrame]
  //   var prevViseme = this.visemes[this.currentFrame-1]
  //   for(var visemeName of this.visemesNames){
  //     if(visemeName === currViseme){
  //       this.modelControl[this.modelControlDict[visemeName]] += this.state.intensity / this.exponent //Math.pow(this.state.intensity, this.exponent)
  //       if(this.modelControl[this.modelControlDict[visemeName]]>1)
  //         this.modelControl[this.modelControlDict[visemeName]] = 1
  //     }
  //     else{
  //       this.modelControl[this.modelControlDict[visemeName]] -= this.state.intensity / (10-this.exponent) //Math.pow(this.state.intensity, this.exponent)
  //       if(this.modelControl[this.modelControlDict[visemeName]]<0)
  //         this.modelControl[this.modelControlDict[visemeName]] = 0
  //     }
  //   }

  //   if(currViseme === prevViseme){
  //     this.exponent -= 1
  //     if(this.exponent < 2) this.exponent = 2;
  //   }
  //   else
  //     this.exponent = 8
  // }

  nextViseme(){
    // decrease added value
    if(this.currentFrame > 0 && this.visemes[this.currentFrame] === this.visemes[this.currentFrame-1]){
      this.exponent -= 0.1
    }
    else
      this.exponent = 10
    // decrease all visemes
    for(var visemeName of Object.keys(this.modelControlDict)){
      if(visemeName !== "wink"){
      this.modelControl[this.modelControlDict[visemeName]] -= this.state.intensity / 10
      if(this.modelControl[this.modelControlDict[visemeName]]<0)
          this.modelControl[this.modelControlDict[visemeName]] = 0
      }
    }
    // increase the current visemes
    var mapping = visemeMap[this.visemes[this.currentFrame]]
    for(var currentVisemeName of Object.keys(mapping)){
      // console.log("ADD", this.visemes[this.currentFrame], currentVisemeName, this.modelControl[this.modelControlDict[currentVisemeName]])
      // calculate the added value
      var inc = Math.pow(this.state.intensity, this.exponent)
      // check if the visime is relative
      if(mapping[currentVisemeName] > 1)
        inc /= 4
      // add the value
      this.modelControl[this.modelControlDict[currentVisemeName]] += this.state.intensity / 15
      this.modelControl[this.modelControlDict[currentVisemeName]] += inc
      // check constraints
      if(this.modelControl[this.modelControlDict[currentVisemeName]] > 1 && mapping[currentVisemeName] > 1)
          this.modelControl[this.modelControlDict[currentVisemeName]] = 1
      if(this.modelControl[this.modelControlDict[currentVisemeName]] > mapping[currentVisemeName]*this.state.intensity && !(mapping[currentVisemeName] > 1))
        this.modelControl[this.modelControlDict[currentVisemeName]] = mapping[currentVisemeName]*this.state.intensity
    }
  }

  resetModel(){
    // this.lidWait = 0
    if(this.modelControl){
      for(var i=0; i<this.modelControl.length; i++){
        if(this.modelControlDict["wink"] !== i)
          this.modelControl[i] = 0;
      }
    }
  }

  animate() {
    if (this.state.animationStatus === 'PLAY' && this.modelControlActive) {
      this.nextViseme()

      this.currentFrame += 1

      if (this.currentFrame >= this.visemes.length) {
        this.currentFrame = 0
      }
    }
    else if(this.state.animationStatus === "STOP"){
        this.currentFrame = 0
        this.resetModel()
    }
    
    this.moveLid()
    this.moveLights()
    this.controls.update()
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    return (
        <div
          ref={(mount) => { this.mount = mount }}
        />
    )
  }
}

export default Model