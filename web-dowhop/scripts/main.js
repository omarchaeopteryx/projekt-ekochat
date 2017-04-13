/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // OM ADD: DOM elements for the new chatroom form
  this.newChatForm = document.getElementById('new-chat-form')
  this.newChatInputTitle = document.getElementById('new-chat-input-title')
  this.newChatInputWho = document.getElementById('new-chat-input-who')
  this.newChatInputWhenDate = document.getElementById('new-chat-input-when-date')
  this.newChatInputWhenTime = document.getElementById('new-chat-input-when-time')
  this.newChatInputWhere = document.getElementById('searchTextField')
  this.newChatButton = document.getElementById('new-chat-button')
  this.newChatPopup = document.getElementById('new-chat-popup')
  this.chatList = document.getElementById('chat-list')

  // OM ADD: Save chats on chatroom form submit:
  this.newChatForm.addEventListener('submit', this.saveChat.bind(this));

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
  this.submitImageButton.addEventListener('click', function(e) {
    e.preventDefault();
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.initFirebase = function() {
  // Added: Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Loads messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function() {
  // Added: Load and listens for new messages.
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('messages');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();
  // Loads the last x number of messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage); //
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};

// OM: We want to load a user's chatroom history by user-id references:
FriendlyChat.prototype.loadChats = function() {

  // First, make sure the view element is chosen:
  var myView = this.chatList;

  // Second, make sure we have reference to the current user's data:
  var me = this.auth.currentUser;
  var myRef = this.database.ref().child('chats/' + me.uid);
  // myRef.on('child_added', snap => console.log(snap.val())); <-- Debug

  // Third, retrieve all items from the list of user-specific items:
  myRef.on('child_added', snap => {

    // OM: Simple method for adding db-synced elements:
    // const div = document.createElement('div');
    // div.appendChild.createElement('button');
    // div.firstChild.innerText = snap.val().title;
    // div.firstChild.id = snap.key;
    // myView.appendChild(div);

    // OM: Alternative Method for creating buttons
      var container = document.createElement('div');
      container.innerHTML = '<button type="submit" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect">' + '</button>'; // <-- Refactor!
      // container.innerHTML = FriendlyChat.CHAT_TEMPLATE;
      let button = container.firstChild;
      button.setAttribute('id', snap.key);
      button.innerHTML = snap.val().title;
      // div.text(childData);
      myView.appendChild(button);

  });
    // var setChat = function(data) {
    //   var val = data.val();
    //   this.displayChat(data.key, val.title);
    // }.bind(this);
    // this.chatsRef.limitToLast(12).on('child_added', setChat);
    // this.chatsRef.limitToLast(12).on('child_changed', setChat);
};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value && this.checkSignedInWithMessage()) {

    // ADDED: push new message to Firebase.
    var currentUser = this.auth.currentUser;
    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      name: currentUser.displayName,
      text: this.messageInput.value,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png' // <- Optional to customize.
    }).then(function() {
      // Clear message text field and SEND button state.
      FriendlyChat.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });

  }
};

// OM: Button to save your chat thread to the database:
FriendlyChat.prototype.saveChat = function(e) {
  console.log(this.newChatInputTitle.value); // <-- Debugging start
  console.log(this.newChatInputWho.value);
  console.log(this.newChatInputWhenDate.value);
  console.log(this.newChatInputWhenTime.value);
  console.log(this.newChatInputWhere.value);
  console.log("You clicked the new chat button!"); // <-- Debugging end
  e.preventDefault();
  // Check that the user entered a message and is signed in:
  if (this.newChatInputTitle.value && this.checkSignedInWithMessage()) {

    // ADDED: push new chat to Firebase:
    var currentUser = this.auth.currentUser;

    // ADDED: a new chat entry to the Firebase Database:
    this.database.ref('chats/' + currentUser.uid).push({
      title: this.newChatInputTitle.value,
      whenDate: this.newChatInputWhenDate.value,
      whenTime: this.newChatInputWhenTime.value,
      where: this.newChatInputWhere.value,
      who: this.newChatInputWho.value,
      creator: currentUser.uid // <- saves current user ID
    }).then(function() {
      // ADDED: Clear the form and reset the button state.
      this.newChatForm.reset();
      this.toggleButton();
      this.newChatPopup.removeAttribute("hidden");
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });

  }
}

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.messagesRef.push({
      name: currentUser.displayName,
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function(data) {

      // Upload the image to Cloud Storage.
      var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
      return this.storage.ref(filePath).put(file).then(function(snapshot) {

        // Get the file's Storage URI and update the chat message placeholder.
        var fullPath = snapshot.metadata.fullPath;
        return data.update({imageUrl: this.storage.ref(fullPath).toString()});
      }.bind(this));
    }.bind(this)).catch(function(error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    });
  }
};

// OM: Save all users who've logged in into DB via UID for shallow nesting:
FriendlyChat.prototype.saveUser = function() {
  var currentUser = this.auth.currentUser;
  this.database.ref('users/' + currentUser.uid).set({
    name: currentUser.displayName,
    email: currentUser.email,
    uid: currentUser.uid,
    photo: currentUser.photoURL || '/images/profile_placeholder.png',
    note: "N/A"
  })
}

// Signs-in Friendly Chat.
FriendlyChat.prototype.signIn = function() {
  // Added: Sign in Firebase with credential from the Google user.
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  // Added: Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
FriendlyChat.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;   // Added: Get profile pic.
    var userName = user.displayName;        // Added: Get user's name.

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chat messages.
    this.loadMessages();

    // We want to load currently existing threads.
    this.loadChats(); // <-- Check.

    // We want to save currently signed-in user.
    this.saveUser(); // <-- Check.

    // We save the Firebase Messaging Device token and enable notifications.
    this.saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
  /* Added: Check if user is signed-in Firebase. */

  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first, please!',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// ADDED: Saves the messaging device token to the datastore.
FriendlyChat.prototype.saveMessagingDeviceToken = function() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
          .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
};

// ADDED: Requests permissions to show notifications.
FriendlyChat.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// OM ADD: Templates for Chats.

FriendlyChat.CHAT_TEMPLATE =
  '<div class="chat-container">' +
    '<div class="spacing-2"><div class="pic-2"></div></div>' +
    '<div class="chat"></div>' +
    '<div class="title"</div>' +
    '</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// OM ADD: We want to display the list of chats in the UI <-- FIX!
// FriendlyChat.prototype.displayChat = function(childKey, childData) {
//   var div = document.getElementById(childKey);
//   if (!div) {
//     var container = document.createElement('div');
//     container.innerHTML = '<section>' + '<p>' + '</p>' + '</section>';
//     // container.innerHTML = FriendlyChat.CHAT_TEMPLATE;
//     div = container.firstChild;
//     div.setAttribute('id', childKey);
//     // div.text(childData);
//     this.chatList.appendChild(div);
//   }
// };

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Cloud Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  }
};

window.onload = function() {
  window.friendlyChat = new FriendlyChat();
};

// Dev Notes: use firebase.auth().currentUser.uid in console to find current user id
