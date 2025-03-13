<template>
    <v-dialog v-model="dialog" max-width="290">
        <v-card>
            <v-card-title>
                <span class="headline">Add Friend</span>
            </v-card-title>
            <v-card-text>
                <v-text-field v-model="friendUsername" label="Friend Username"></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="addFriend">Add</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>