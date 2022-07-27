import './style.scss'
import * as THREE from 'three'
import gsap from 'gsap'


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'


import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const canvas = document.querySelector('canvas.webgl')
const gtlfLoader = new GLTFLoader()


const scene = new THREE.Scene()
 // scene.background = new THREE.Color( 0xffffff )




const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true,
  depthWrite: false,
  clipShadows: true,
  wireframe: false,
  side: THREE.DoubleSide,
  uniforms: {

    uTime: {
      value: 0
    },

    uResolution: { type: 'v2', value: new THREE.Vector2() }

  }
})


let geometry =   new THREE.PlaneGeometry( 2, 2, 128, 128)

let mesh = new THREE.Mesh(geometry, shaderMaterial)

// scene.add(mesh)



const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>{



  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2 ))


})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0,0,2.5)
scene.add(camera)

//const controls = new OrbitControls(camera, canvas)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//renderer.setClearColor( 0x000000, 1)
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const light = new THREE.PointLight( 0xff0000, 1, 100 );
light.position.set( 50, 50, 50 );
scene.add( light );

// const light = new THREE.AmbientLight( 0x404040 )
// scene.add( light )

let sceneGroup, screenW, cone, glass

let coverArr = []
gtlfLoader.load(
  'lamp.glb',
  (gltf) => {
    gltf.scene.scale.set(0.5,0.5,0.5)
    sceneGroup = gltf.scene
    sceneGroup.needsUpdate = true
    sceneGroup.position.y -= 1.2
    sceneGroup.position.z -= .5
    scene.add(sceneGroup)
    console.log(sceneGroup)


    screenW = gltf.scene.children.find((child) => {
      return child.name === 'screen'
    })

    cone = gltf.scene.children.find((child) => {
      return child.name === 'cone'
    })

    glass = gltf.scene.children.find((child) => {
      return child.name === 'glass'
    })




    cone.material = new THREE.MeshPhongMaterial({ specular: 'white'})

  //     glass.material = new THREE.MeshPhysicalMaterial({color: 'red', transparent: true, roughness: 0.7,
  // transmission: 1.,
  // thickness: 1.})

  //glass.material= new THREE.MeshPhongMaterial({ specular: 'white', transparent: true, opacity: .1})


  screenW.material = shaderMaterial








  }
)


let titular = document.getElementById('titular')

console.log(titular)
titular.addEventListener('click', function (e) {
  console.log(sceneGroup.rotation.y)
  if(sceneGroup.rotation.y < 0.001 || sceneGroup.rotation.y === 0){
  gsap.to(sceneGroup.rotation, {duration: 1, y: sceneGroup.rotation.y + Math.PI * 1, repeat: 0, ease: "none"});
}

if(sceneGroup.rotation.y === 3.141593){
gsap.to(sceneGroup.rotation, {duration: 1, y: sceneGroup.rotation.y - Math.PI * 1, repeat: 0, ease: "none"});
}
});


const clock = new THREE.Clock()

const tick = () =>{

  const elapsedTime = clock.getElapsedTime()


  // Update controls
  //controls.update()

  if(shaderMaterial.uniforms.uResolution.value.x === 0 && shaderMaterial.uniforms.uResolution.value.y === 0 ){
    shaderMaterial.uniforms.uResolution.value.x = renderer.domElement.width
    shaderMaterial.uniforms.uResolution.value.y = renderer.domElement.height
  }




  shaderMaterial.uniforms.uTime.value = elapsedTime

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
