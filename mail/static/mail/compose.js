document.addEventListener('DOMContentLoaded', function (){
  let form = document.querySelector('#compose-form');
  const msg = document.querySelector('#message-sent');
  let status = 0;
  form.addEventListener('submit', (event) => {
      event.preventDefault();
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value,
        }),
    }).then(function(response) {
          status = response.status;
          console.log(status)
          return response.json()
      }).then(result => {
        console.log(result.message)
        if(status == 201){
            
            load_mailbox('sent');
            msg.innerHTML = `<h4>${result.message}</h4>`;
        }else{
            msg.innerHTML = `<h4>${result.error}</h4>`;
        }
    })
      
  });
})