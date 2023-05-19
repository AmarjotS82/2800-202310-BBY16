var iconVisible = document.querySelector('.bi-heart');
        var iconHidden = document.querySelector('.bi-heart-fill');

        iconVisible.addEventListener('click', function () {
          iconHidden.style.display = 'inline-block';
        });

        var saveButton = document.querySelector('.save');

        saveButton.addEventListener('click', function () {
          swal("Recipe saved successfully!", "checkout saved recipe page!", "success");
        });


        var visible = document.querySelector('.logo');
        var invisible = document.querySelector('.wheel-and-hamster');
        visible.addEventListener('click', function () {
          invisible.style.display = 'block';
          visible.style.display = 'none';
        });
