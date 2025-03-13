<template>
    <v-dialog v-model="dialog" max-width="290">
        <v-card>
            <v-card-title>
                <span class="headline">Session Detail</span>
            </v-card-title>
            <v-card-text>
                <v-text-field v-model="sessionName" label="Session Name"></v-text-field>
                <v-text-field v-model="sessionDescription" label="Session Description"></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="updateSession">Update</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>