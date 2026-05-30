<script setup lang="ts">
import { ref } from 'vue'
import { signUp, signIn, useSession } from '~/utils/auth-client'

// console.log(authClient)
const session = useSession()
// console.log('Current session:', session)

const name = ref('')
const email = ref('')
const password = ref('')
const errorMsg = ref('')

const handleRegister = async () => {
	errorMsg.value = ''

	const { data, error } = await signUp.email({
		email: email.value,
		password: password.value,
		name: name.value,
		callbackURL: '/',
	})

	if (error) {
		errorMsg.value = error.message || 'Ошибка регистрации'
	} else {
		console.log('Registration successful, user data:', data)
		// await navigateTo('/');
	}
}
const handleLogin = async () => {
	errorMsg.value = ''

	const { data, error } = await signIn.email({
		email: email.value,
		password: password.value,
	})

	if (error) {
		errorMsg.value = error.message || 'Неверный логин или пароль'
	} else {
		console.log('Login successful, user data:', data)
		// await navigateTo('/');
	}
}
</script>

<template>
	<div>
		<div v-if="session.isPending">Skeleton loading...</div>
		<div v-else-if="session.data">
			<p class="font-medium">Welcome, {{ session.data.user.name }}</p>
			<p class="font-sm">{{ session.data.user.email }}</p>

			<Button color="neutral" variant="outline" @click="signOut()">
				Sign Out
			</Button>
		</div>
		<div v-else>
			<div>
				<h2>Регистрация / Логин</h2>
				<form @submit.prevent>
					<Input v-model="name" type="text" placeholder="Имя" required />
					<Input v-model="email" type="email" placeholder="Email" required />
					<Input
						v-model="password"
						type="password"
						placeholder="Пароль"
						required
					/>
					<button type="button" @click="handleRegister">Создать аккаунт</button>
					<button type="button" @click="handleLogin">Войти</button>
				</form>
				<p v-if="errorMsg">{{ errorMsg }}</p>
			</div>
		</div>
	</div>
</template>
