<template>  
    <div>
        <h1>User Profile</h1>
        <p>Username: {{ user.username }}</p>
        <p>Email: {{ user.email }}</p>
        <p>First Name: {{ user.first_name }}</p>
        <p>Last Name: {{ user.last_name }}</p>
        <p>Friends:</p>
        <div v-for="friend in user.friends" :key="friend.id">
            <p>{{ friend.username }}</p>
        </div>
    </div>
</template>