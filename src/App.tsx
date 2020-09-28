import React, { useState, useRef } from 'react'
import './App.css'

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
	// INIT
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

	const [user] = useAuthState(auth);

	return (
	<div className="App">
		<header>
			<h1>♥</h1>
			<CerrarSesion />
		</header>

		<section>
			{user ? <SalaChat /> : <IniciarSesion/>}
		</section>

	</div>
	);
}

function IniciarSesion() {
	const iniciarSesionConGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	}

	return (
		<button className="iniciarSesion" onClick={iniciarSesionConGoogle}>Iniciar sesión con Google</button>
	)
}

function CerrarSesion() {
	return auth.currentUser && (
		<button onClick={() => auth.signOut()}>Cerrar sesión</button>
	)
}

function SalaChat() {

	const dummyScroll:any = useRef();
	const mensajesRef = firestore.collection('mensajes');
	const query = mensajesRef.orderBy('fechaCreacion').limit(25);

	const [mensajes] = useCollectionData(query, {idField: 'id'});

	const [valorFormulario, setValorFormulario] = useState('');

	const enviarMensaje = async(e: any) => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser;

		await mensajesRef.add({
			texto: valorFormulario,
			fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL
		})

		setValorFormulario('');
		dummyScroll.current.scrollIntoView({ behavior: 'smooth' });
	}

	return (

		<>
			<main>
				{mensajes && mensajes.map((msg: any) => <Mensaje key={msg.id} mensaje={msg} />)}
				<span ref={dummyScroll}></span>
			</main>

			<form onSubmit={enviarMensaje}>
				
				<input value={valorFormulario} onChange={(e) => setValorFormulario(e.target.value)} />

				<button type="submit">Enviar</button>

			</form>
		</>

	)

}

function Mensaje(props: any) {
	const { texto, uid, photoURL } = props.mensaje;

	const tipoMensaje = uid === auth.currentUser.uid ? 'enviado' : 'recibido';

	return (
		<div className={`mensaje ${tipoMensaje}`}>
			<img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Foto del usuario" />
			<p>{ texto }</p>
		</div>
	)
}

export default App;
