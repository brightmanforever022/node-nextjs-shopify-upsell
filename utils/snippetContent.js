export default `{% for key_value in shop.metafields.tipjar.settings %}
{% if key_value[0] == 'enableTipJar' %}
  {% assign tipjar_settings_enableTipJar = key_value[1] %}
{% endif %}

{% if key_value[0] == 'enableCustomTipOption' %}
  {% assign tipjar_settings_enableCustomTipOption = key_value[1] %}
{% endif %}

{% if key_value[0] == 'tipModalTitle' %}
  {% assign tipjar_settings_tipModalTitle = key_value[1] %}
{% endif %}

{% if key_value[0] == 'tipModalDescription' %}
  {% assign tipjar_settings_tipModalDescription = key_value[1] %}
{% endif %}

{% if key_value[0] == 'defaultTipping15' %}
  {% assign tipjar_settings_defaultTipping15 = key_value[1] %}
{% endif %}

{% if key_value[0] == 'defaultTipping20' %}
  {% assign tipjar_settings_defaultTipping20 = key_value[1] %}
{% endif %}

{% if key_value[0] == 'defaultTipping25' %}
  {% assign tipjar_settings_defaultTipping25 = key_value[1] %}
{% endif %}
{% endfor %}

{% if tipjar_settings_enableTipJar %}

{% assign tipjar_cart_total = cart.total_price %}

{% for item in cart.items %}
  {% if item.product.handle == 'tip-gratuity' %}
    {% assign tipjar_cart_total = tipjar_cart_total | minus: item.final_line_price %}
    {% break %}
  {% endif %}
{% endfor %}

<style>
  .tj-modal {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    z-index: 999999999;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
  }
  
  .tj-modal-background {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  
  .tj-modal-background-inner {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #000000;
    opacity: 0.75;
  }
  
  .tj-modal-content {
    max-height: 100vh;
    background-color: #ffffff;
    border-radius: 10px;
    overflow: auto;
    padding: 12px 16px 24px 16px;
    -webkit-transform: matrix(1, 0, 0, 1, 0, 0);
        -ms-transform: matrix(1, 0, 0, 1, 0, 0);
            transform: matrix(1, 0, 0, 1, 0, 0);
  }
  @media only screen and (min-width: 480px) {
    .tj-modal-content {
      width: 100%;
      max-width: 600px;
      padding: 12px 24px 36px 24px;
    }
  }
  
  .tj-modal-header {
    padding: 20px 16px 16px 16px;
  }
  @media only screen and (min-width: 480px) {
    .tj-modal-header {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: start;
          -ms-flex-align: start;
              align-items: flex-start;
      padding: 24px 24px 16px 24px;
    }
  }
  
  .tj-modal-header-inner {
    width: 100%;
    text-align: center;
  }
  @media only screen and (min-width: 480px) {
    .tj-modal-header-inner {
      margin: 0 16px 0 16px;
      text-align: left;
    }
  }
  
  .tj-modal-title {
    display: block;
    font-size: 24px;
    line-height: 1.2;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .tj-modal-description {
    display: block;
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 0;
  }
  
  @media only screen and (min-width: 480px) {
    .tj-modal-btns-container {
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
    }
  }
  
  .tj-modal-btn-wrapper {
    display: block;
    width: 100%;
    border-radius: 5px;
    padding: 0 8px;
    margin: 12px 0;
  }
  
  .tj-modal-btn {
    width: 100%;
    border-radius: 5px;
    border: 1px solid #999999;
    padding: 8px 16px;
    background-color: #ffffff;
    -webkit-box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    -webkit-transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    -o-transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
  }
  
  .tj-modal-btn-percentage {
    display: block;
    font-weight: bold;
    font-size: 24px;
  }
  
  .tj-modal-btn-amount {
    display: block;
    font-size: 20px;
  }
  @media only screen and (min-width: 480px) {
    .tj-modal-btn-amount {
      margin-top: 8px;
    }
  }
  
  .tj-modal-btn-none {
    display: block;
    margin-top: 16px;
    width: 100%;
    border-radius: 5px;
    padding: 0 8px;
  }
  
  .tj-modal-success-content {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #ffffff;
    -webkit-box-align: center;
        -ms-flex-align: center;
            align-items: center;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
    text-align: center;
    padding: 16px;
  }
  
  .tj-modal-success-title {
    display: block;
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .tj-modal-success-message {
    display: block;
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 0;
  }
  
  .tj-modal-loading-icon-container {
    width: 50px;
    margin: 0 auto 24px auto;
  }
  
  .tj-modal-loading-icon {
    display: block;
    width: 100%;
    -webkit-animation: tj-loading .5s linear infinite;
            animation: tj-loading .5s linear infinite
  }
  
  @-webkit-keyframes tj-loading {
    to {
      -webkit-transform:rotate(1turn);
              transform:rotate(1turn)
    }
  }
  
  @keyframes tj-loading {
    to {
      -webkit-transform:rotate(1turn);
              transform:rotate(1turn)
    }
  }
  
  .tj-modal-input-wrapper {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: stretch;
        -ms-flex-align: stretch;
            align-items: stretch;
    -webkit-box-pack: center;
        -ms-flex-pack: center;
            justify-content: center;
  }
  
  .tj-modal-custom-input {
    min-width: 1px;
    flex-grow: 1;
  }
  
  @media only screen and (min-width: 480px) {
    .tj-modal-input-add {
      width: 180px;
      flex-basis: 180px;
      flex-shrink: 0;
    }
  }
  
  .tj-modal-content-wrapper {
    position: relative;
    text-align: center;
  }
  
  .tj-modal-close {
    display: inline-block;
    text-align: center;
    font-size: 20px;
    color: #ffffff;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.5);
    padding: 0 20px;
    margin-bottom: 12px;
    cursor: pointer;
  }
</style>

<div id="tipJarModal" class="tj-modal" style="display: none;">
  <div class="tj-modal-background">
    <div class="tj-modal-background-inner"></div>
  </div>
  <div class="tj-modal-content-wrapper">
    <div id="tipJarModalClose" class="tj-modal-close">
      &larr; Cancel
    </div>
    <div class="tj-modal-content">
      <div class="tj-modal-header">
        <div class="tj-modal-header-inner">
          <h3 class="tj-modal-title">
            {{ tipjar_settings_tipModalTitle }}
          </h3>
          <p class="tj-modal-description">
            {{ tipjar_settings_tipModalDescription }}
          </p>
        </div>
      </div>
      <div class="tj-modal-btns-container">
        {% if tipjar_settings_defaultTipping15 %}
          <span class="tj-modal-btn-wrapper">
            <button id="tipJarBtn15" type="button" class="tj-modal-btn" data-tipjar-add="{{ tipjar_cart_total | times: 0.15 }}">
              <span class="tj-modal-btn-percentage">15%</span>
              <span id="tipJarAmt15" class="tj-modal-btn-amount">{{ tipjar_cart_total | times: 0.15 | money }}</span>
            </button>
          </span>
        {% endif %}
        {% if tipjar_settings_defaultTipping20 %}
          <span class="tj-modal-btn-wrapper">
            <button id="tipJarBtn20" type="button" class="tj-modal-btn" data-tipjar-add="{{ tipjar_cart_total | times: 0.20 }}">
              <span class="tj-modal-btn-percentage">20%</span>
              <span id="tipJarAmt20" class="tj-modal-btn-amount">{{ tipjar_cart_total | times: 0.20 | money }}</span>
            </button>
          </span>
        {% endif %}
        {% if tipjar_settings_defaultTipping25 %}
        <span class="tj-modal-btn-wrapper">
          <button id="tipJarBtn25" type="button" class="tj-modal-btn" data-tipjar-add="{{ tipjar_cart_total | times: 0.25 }}">
            <span class="tj-modal-btn-percentage">25%</span>
            <span id="tipJarAmt25" class="tj-modal-btn-amount">{{ tipjar_cart_total | times: 0.25 | money }}</span>
          </button>
        </span>
        {% endif %}
      </div>

      {% if tipjar_settings_enableCustomTipOption %}
        <span class="tj-modal-btn-wrapper">
          <button id="tipJarBtnCustom" type="button" class="tj-modal-btn">
            <span class="tj-modal-btn-percentage">Custom amount</span>
          </button>

          <span id="tipJarCustomInputWrapper" class="tj-modal-input-wrapper" style="display: none;">
            <input id="tipJarCustomInput" class="tj-modal-custom-input" type="number" value="0">
            <button id="tipJarCustomInputAdd" class="tj-modal-btn tj-modal-btn-percentage tj-modal-input-add" type="button" data-tipjar-add="0">Add</button>
          </span>
        </span>
      {% endif %}

      <span class="tj-modal-btn-none">
        <button type="button" class="tj-modal-btn" data-tipjar-add="0">
          <span class="tj-modal-btn-percentage">No tip</span>
        </button>
      </span>

      <div id="tipJarSuccess" class="tj-modal-success-content" style="display: none;">
        <div>
          <div class="tj-modal-loading-icon-container">
            <svg class="tj-modal-loading-icon" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><path d="M15.542 1.487A21.507 21.507 0 00.5 22c0 11.874 9.626 21.5 21.5 21.5 9.847 0 18.364-6.675 20.809-16.072a1.5 1.5 0 00-2.904-.756C37.803 34.755 30.473 40.5 22 40.5 11.783 40.5 3.5 32.217 3.5 22c0-8.137 5.3-15.247 12.942-17.65a1.5 1.5 0 10-.9-2.863z"></path></svg>
          </div>
          <p class="tj-modal-success-title">Thank you</p>
          <p class="tj-modal-success-message">You are now being directed to the checkout page.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  if (typeof fetch == 'function') {
    var onCartSubmit = function onCartSubmit(event) {
      // Show modal
      document.getElementById('tipJarModal').style.display = 'flex';
      
      // Grab up to date cart data (needed for ajax carts)
      fetch('/cart.js', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        console.log('Current cart data:', data);
        var lineItems = data.items;
        console.log('lineItems:', lineItems);
        var tjTotal = 0;
        lineItems.forEach(function (item) {
          if (item.handle != 'tip-gratuity') {
            tjTotal = tjTotal + item.final_line_price;
          }
        });
        console.log('tjTotal:', tjTotal);
        
        {% if tipjar_settings_defaultTipping15 %}
          document.getElementById('tipJarAmt15').textContent = '$' + (tjTotal * .15 / 100).toFixed(2);
          document.getElementById('tipJarBtn15').setAttribute('data-tipjar-add', (tjTotal * .15).toFixed(2));
        {% endif %}
        
        {% if tipjar_settings_defaultTipping20 %}
          document.getElementById('tipJarAmt20').textContent = '$' + (tjTotal * .20 / 100).toFixed(2);
          document.getElementById('tipJarBtn20').setAttribute('data-tipjar-add', (tjTotal * .20).toFixed(2));
        {% endif %}
        
        {% if tipjar_settings_defaultTipping25 %}
          document.getElementById('tipJarAmt25').textContent = '$' + (tjTotal * .25 / 100).toFixed(2);
          document.getElementById('tipJarBtn25').setAttribute('data-tipjar-add', (tjTotal * .25).toFixed(2));
        {% endif %}
        
      }).catch(function (error) {
        console.error('Error grabbing cart data, go straight to checkout:', error);
        window.location.href = '/checkout';
      });
    };
    
    {% if tipjar_settings_enableCustomTipOption %}
    var customBtn = document.getElementById('tipJarBtnCustom');
    var customInputWrapper = document.getElementById('tipJarCustomInputWrapper');
    var customInput = document.getElementById('tipJarCustomInput');
    var customInputAdd = document.getElementById('tipJarCustomInputAdd');
    
    customInput.oninput = function (event) {
      var tipValue = event.target.value;
      customInputAdd.setAttribute('data-tipjar-add', (tipValue * 100).toFixed(2));
    };
    
    customBtn.onclick = function (event) {
      event.preventDefault();
      customBtn.style.display = 'none';
      customInputWrapper.style.display = 'flex';
    }
    {% endif %}

    var tipJarAddBtns = document.querySelectorAll('[data-tipjar-add]');
    tipJarAddBtns.forEach(function (btn) {
      btn.onclick = function (event) {
        console.log('click event', event); // Show loading/success message

        document.getElementById('tipJarSuccess').style.display = 'flex';
        var value = parseInt(event.currentTarget.getAttribute('data-tipjar-add'));
        var tipProductData = {
          updates: {
            {{ all_products['tip-gratuity'].first_available_variant.id }}: value
          }
        };
        fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tipProductData)
        }).then(function (response) {
          return response.json();
        }).then(function (data) {
          console.log('Success:', data);
          window.location.href = '/checkout';
        }).catch(function (error) {
          console.error('Error:', error);
          window.location.href = '/checkout';
        });
      };
    });
    
    var tipJarModalClose = document.getElementById('tipJarModalClose');
    tipJarModalClose.onclick = function() {
      document.getElementById('tipJarModal').style.display = 'none';
    }
    
    document.addEventListener('submit', function (event) {
      console.log('event', event);

      if (event.target.getAttribute('action') == '/cart' && event.submitter.getAttribute('name') != 'update') {
        event.preventDefault();
        onCartSubmit(event);
      }
    });
  } else {
    console.log('Fetch not found, go straight to checkout.');
    window.location.href = '/checkout';
  }
</script>
{% endif %}`
