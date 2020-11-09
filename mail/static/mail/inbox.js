document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => 
  load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
    
  // By default, load the inbox
  load_mailbox('inbox');
  
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
     
}


function load_mailbox(mailbox) {
 // Clear out composition fields if leaving reply mode
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
    
 fetch(`/emails/${mailbox}`).then(response => response.json()).then(emails => {
  emails.forEach(email => {
    console.log(email)
    var recipient = email.sender;
    if(mailbox == 'sent'){
        recipient = email.recipients;
    }
    var card = document.createElement('div');
    card.className = "card border border-dark rounded-0 my-0 p-0";
    var is_read = email.read;
    var color = is_read? 'bg-light' : '';
    var timecolor = is_read? 'text-dark' : 'text-muted'
    card.innerHTML = `<div class="card-body my-0 p-2 ${color}" id="card.${email.id}">
    <div class="row my-0">
    <div class ="col-4 my-0 text-truncate font-weight-bold">
    ${recipient}
    </div>
    <div class ="col-4 my-0 text-truncate">
    ${email.subject}  
    </div>
    <div class ="col-4 my-0 text-truncate ${timecolor} text-right">
    ${email.timestamp}
    </div>
    </div>
    </div>`;
    card.addEventListener('click', function() {
        view_mail(email.id, mailbox);
        console.log('This element has been clicked')
    });
    /*if(mailbox == 'inbox' && email.archived == false){
        document.querySelector('#emails-view').append(card)
    }
    else if(mailbox == 'archive'  && email.archived == true){
        document.querySelector('#emails-view').append(card)
    }
    else if(mailbox == 'sent'){
        document.querySelector('#emails-view').append(card)
    }*/
    document.querySelector('#emails-view').append(card);
 });
 });
    // Show the mailbox and hide other views
  document.querySelector('#message-sent').innerHTML = '';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


function view_mail(email_id, mailbox) {
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    });
    fetch(`/emails/${email_id}`)
    .then(response => response.json()).then(email => {
    document.querySelector("#emails-view").innerHTML = '';
    var headers = ['From:', 'To:', 'Subject:', 'Timestamp:'];
    var header = document.createElement('div');
    var body = document.createElement('div');
    body.className = `card p-0 border-0`;
    body.className = `div my-1 card border-0`;
        
        //Create replybutton
    var replydiv = document.createElement('div');
    replydiv.className = 'btn ml-1';
    var replybtn = document.createElement('btn');
    replybtn.className = 'btn btn-sm btn-outline-primary';
    replybtn.textContent ='Reply';
    replydiv.append(replybtn);
    replybtn.addEventListener('click', () => {
                              reply_email(email);
                              });
        
        //Create archivebutton
    var archivediv = document.createElement('div');
    archivediv.className = 'btn ml-1 justify-right';
    var archivebtn = document.createElement('btn');
    archivebtn.className = 'btn btn-sm btn-outline-secondary';
    if(email.archived == true){
        archivebtn.textContent ='Unarchive';
    }else{
        archivebtn.textContent ='Archive';
    }
    archivediv.append(archivebtn);
    archivebtn.addEventListener('click', () => {
                              archive(email);
                              });
        
    header.innerHTML = `<class="card-body p-0" style="white-space:pre-wrap;">
    ${headers[0].bold()} ${email.sender} 
    ${headers[1].bold()} ${email.recipients}
    ${headers[2].bold()} ${email.subject}
    ${headers[3].bold()} ${email.timestamp}`; 
       
    document.querySelector('#emails-view').append(header);
    document.querySelector('#emails-view').append(replydiv);
    if (mailbox != 'sent'){
    document.querySelector('#emails-view').append(archivediv);
    }
    body.innerHTML = `<div class="card-body mt-1 p-0" style="white-space:pre-wrap;">
    <hr>
    ${email.body}
    </div>`;
        
    document.querySelector('#emails-view').append(body);
    });  
    document.querySelector('#message-sent').innerHTML = '';
}


function reply_email(email) {
    compose_email();
    
    let recipient = email.sender;
    let time = email.timestamp;
    //let sender = email.recipients;
    let subject = email.subject;
    if (!subject.match(/Re:/)) subject = `Re: ${subject}`;
    let body = email.body;
    console.log(body);
    const marker = '<<<';
    var result = body.substring(body.indexOf(marker) + marker.length);
    
    console.log(result);
    
  
  // Load composition fields
    document.querySelector('#compose-recipients').value = recipient;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = `>>>On ${time} ${email.sender} wrote:\n ${result} \r\n<<<`;
}


function archive(email) {
    let is_archived = email.archived;
    var bool = is_archived? false : true; 
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: bool
      })
    }).then(response => {
        load_mailbox('inbox');
    });
}