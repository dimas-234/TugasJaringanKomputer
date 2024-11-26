import * as THREE from './modules/three.module.js';

main();

function main() {
    // Membuat context
    const canvas = document.querySelector("#c");
    const gl = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });

    // Membuat kamera
    const angleOfView = 55;
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    const nearPlane = 0.1;
    const farPlane = 100;
    const camera = new THREE.PerspectiveCamera(
        angleOfView,
        aspectRatio,
        nearPlane,
        farPlane
    );
    camera.position.set(0, 8, 30);

    // Membuat scene
    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();

    // Memuat tekstur untuk background atas
    const backgroundTexture = textureLoader.load('textures/lapangan.jpg');

    // Membuat plane atas
    const upperPlaneGeometry = new THREE.PlaneGeometry(100, 100);
    const upperPlaneMaterial = new THREE.MeshBasicMaterial({
        map: backgroundTexture,
        side: THREE.DoubleSide
    });
    const upperPlane = new THREE.Mesh(upperPlaneGeometry, upperPlaneMaterial);
    upperPlane.rotation.x = -Math.PI / 2; // Memutar plane
    upperPlane.position.y = 20; // Menempatkan plane di atas
    scene.add(upperPlane);

    // Membuat plane bawah dengan tekstur
    const lowerPlaneTexture = textureLoader.load('textures/rumput.jpg'); // Ganti dengan tekstur yang diinginkan
    const lowerPlaneGeometry = new THREE.PlaneGeometry(100, 100);
    const lowerPlaneMaterial = new THREE.MeshBasicMaterial({
        map: lowerPlaneTexture,
        side: THREE.DoubleSide
    });
    const lowerPlane = new THREE.Mesh(lowerPlaneGeometry, lowerPlaneMaterial);
    lowerPlane.rotation.x = -Math.PI / 2; // Memutar plane
    lowerPlane.position.y = -10; // Menempatkan plane sedikit di bawah
    scene.add(lowerPlane);

    // GEOMETRY
    // Membuat kubus
    const cubeSize = 5.5;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);  

    // Membuat bola (Planet Jupiter)
    const sphereRadius = 4;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 16);

    // MATERIALS
    const waterTexture = textureLoader.load('textures/balbal.jpg'); // Memuat tekstur air
    const cubeMaterial = new THREE.MeshStandardMaterial({
        map: waterTexture // Menggunakan tekstur air
    });

    // Memuat tekstur Jupiter
    const jupiterTexture = textureLoader.load('textures/balbal.jpg');
    const sphereMaterial = new THREE.MeshStandardMaterial({
        map: jupiterTexture // Menggunakan tekstur Jupiter
    });

    // MESHES
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-5, sphereRadius, 0); // Tempatkan bola sejajar secara vertikal
    scene.add(sphere);

    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(5, cubeSize / 2, 0); // Tempatkan kubus sejajar secara vertikal
    scene.add(cube);

    // LIGHTS
    const light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(0, 30, 30);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // PARTIKEL HUJAN
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 50; // x
        positions[i * 3 + 1] = Math.random() * 30 + 10; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // z
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0x00aaff, // Warna hujan
        transparent: true,
        opacity: 0.8
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Gerakan objek
    let direction = 1; // Arah gerakan
    const speed = 0.05; // Kecepatan gerakan

    // DRAW
    function draw(time) {
        time *= 0.001;

        if (resizeGLToDisplaySize(gl)) {
            const canvas = gl.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;

        sphere.rotation.y += 0.01; // Putar planet Jupiter

        // Gerakkan partikel hujan ke bawah
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.5; // Kecepatan jatuh
            if (positions[i] < 0) {
                positions[i] = Math.random() * 30 + 10; // Reset posisi y
            }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Gerakan maju mundur objek
        cube.position.z += direction * speed;
        sphere.position.z += direction * speed;

        // Balik arah jika mencapai batas
        if (cube.position.z > 10 || cube.position.z < -10) {
            direction *= -1; // Balik arah
        }

        gl.render(scene, camera);
        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

// UPDATE RESIZE
function resizeGLToDisplaySize(gl) {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
}
