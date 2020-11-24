import React, { Component } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js'


class Model extends Component {
  constructor(props) {
    super(props)
    this.state = {
        animationStatus: this.props.animationStatus,
    }

    this.mouthHeight = []
    this.mouthWidth = []

    this.move = 0.02
    this.delta = 0

    this.modelControlActive = false

    this.currentFrame = 0

    this.lidMove = 0.1
    this.lidSpeed = 0.1
    this.lidWait = 1

    this.obamaRatio = [0.8, 0.8]

    this.start = this.start.bind(this)
    this.animate = this.animate.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
    this.addCube = this.addCube.bind(this)
    this.addModel = this.addModel.bind(this)
    this.getMouthControl = this.getModelControl.bind(this)
    this.moveLid = this.moveLid.bind(this)
    this.moveMouth = this.moveMouth.bind(this)
  }

  componentDidMount() {
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
    var light = new THREE.HemisphereLight(0xffffff, 0x444444);
    this.scene.add(light)

    this.addModel()

    this.camera.position.z = 0.5
    this.camera.position.y = 0

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    this.renderer.setClearColor('#ffffff')
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
      if(prevProps.mouthMoves !== this.props.mouthMoves){
          console.log(prevProps.mouthMoves,this.props.mouthMoves)
        this.mouthWidth = this.props.mouthMoves[0]
        this.mouthHeight = this.props.mouthMoves[1]
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

    loader.load('model/head_shape_keys.gltf', gltf => {
      this.model = SkeletonUtils.clone(gltf.scene)
      // console.log(this.model)
      this.scene.add(this.model)
      this.getModelControl()
      this.renderScene()
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
    this.stop()
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
        if (o.isSkinnedMesh && o.name === 'head') {
          this.modelControl = o.morphTargetInfluences;
        }
      })
      this.modelControlActive = true
    }
  }


  calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
  }


  moveLid(){
    if(this.modelControlActive)
    {
    if(this.modelControl[2] < 0){
      if (this.lidWait > 100){
        this.lidMove = this.lidSpeed;
        this.lidWait = 0
      }
      else {
        this.lidMove = 0
      }
      this.lidWait += 1
    }
    else if (this.modelControl[2] > 1) {
      this.lidMove = -this.lidMove;
    }

    this.modelControl[2] = this.modelControl[2] + this.lidMove;
    }
  }

  moveMouth(){
      if(this.modelControlActive)
      {
          this.modelControl[0] = this.mouthHeight[this.currentFrame]
          this.modelControl[1] = this.mouthWidth[this.currentFrame]
      }
  }

  animate() {
    if (this.state.animationStatus == 'PLAY' && this.modelControlActive) {
      this.moveMouth()
      // this.modelControl[1] = 1.6/this.obamaRatio[0]-1
      // this.modelControl[0] = -0.2/this.obamaRatio[1]
      this.moveLid()

      if (this.currentFrame >= this.mouthWidth.length || this.currentFrame === 0) {
        this.currentFrame = 0
      }

      this.currentFrame += 1
    }
    else if(this.state.animationStatus == "STOP"){
        this.currentFrame = 0
        this.moveMouth()
    }

    // setTimeout(() => {
    this.controls.update()
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
    
    // }, 1000 / 60)   // 25 fps

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