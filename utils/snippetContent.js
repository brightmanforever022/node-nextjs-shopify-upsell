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
      padding: 0 16px 16px 16px;
      z-index: 99999;
    }
    @media only screen and (min-width: 480px) {
      .tj-modal {
        display: flex;
        align-items: center;
        justify-content: center;
      }
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
      background-color: #666666;
      opacity: 0.75;
    }
    
    .tj-modal-content {
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      padding: 12px 16px;
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
        display: flex;
        align-items: flex-start;
        padding: 24px 24px 16px 24px;
      }
    }
    
    .tj-modal-header-inner {
      width: 100%;
      margin-top: 12px;
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
        display: flex;
      }
    }
    
    .tj-modal-btn-wrapper {
      width: 100%;
      border-radius: 5px;
      padding: 0 8px;
      margin-top: 12px;
    }
    
    .tj-modal-btn {
      width: 100%;
      border-radius: 5px;
      border: 1px solid #999999;
      padding: 8px 16px;
      background-color: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      transition: all 0.3s cubic-bezier(.25,.8,.25,1);
    }
    
    .tj-modal-btn-percentage {
      display: block;
      font-weight: bold;
      font-size: 24px;
    }
    
    .tj-modal-btn-amount {
      display: block;
      margin-top: 8px;
      font-size: 20px;
    }
    
    .tj-modal-btn-none {
      display: block;
      margin-top: 16px;
      width: 100%;
      border-radius: 5px;
      padding: 0 8px;
    }
    
  </style>

  <div id="tipJarModal" class="tj-modal fixed bottom-0 inset-x-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center sm:justify-center" style="display: none;">
    <div class="tj-modal-background fixed inset-0 transition-opacity">
      <div class="tj-modal-background-inner absolute inset-0 bg-gray-500 opacity-75"></div>
    </div>
    <div class="tj-modal-content bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full px-4 py-3 sm:px-6">
      <div class="tj-modal-header sm:flex sm:items-start bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="tj-modal-header-inner w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 class="tj-modal-title block mb-2 text-lg leading-6 font-medium text-gray-900">
            {{ tipjar_settings_tipModalTitle }}
          </h3>
          <p class="tj-modal-description text-sm leading-5 text-gray-500">
            {{ tipjar_settings_tipModalDescription }}
          </p>
        </div>
      </div>
      <div class="tj-modal-btns-container">
        {% if tipjar_settings_defaultTipping15 %}
          <span class="tj-modal-btn-wrapper">
            <button type="button" class="tj-modal-btn" data-tipjar-add="{{ tipjar_cart_total | times: 0.15 }}">
              <span class="tj-modal-btn-percentage">15%</span>
              <span class="tj-modal-btn-amount">{{ tipjar_cart_total | times: 0.15 | money }}</span>
            </button>
          </span>
        {% endif %}
        {% if tipjar_settings_defaultTipping20 %}
          <span class="tj-modal-btn-wrapper">
            <button type="button" class="tj-modal-btn" data-tipjar-add="{{ tipjar_cart_total | times: 0.20 }}">
              <span class="tj-modal-btn-percentage">20%</span>
              <span class="tj-modal-btn-amount">{{ tipjar_cart_total | times: 0.20 | money }}</span>
            </button>
          </span>
        {% endif %}
        {% if tipjar_settings_defaultTipping25 %}
        <span class="tj-modal-btn-wrapper">
          <button type="button" class="tj-modal-btn" data-tipjar-add="{{ tipjar_cart_total | times: 0.25 }}">
            <span class="tj-modal-btn-percentage">25%</span>
            <span class="tj-modal-btn-amount">{{ tipjar_cart_total | times: 0.25 | money }}</span>
          </button>
        </span>
        {% endif %}
      </div>
      
      <span class="tj-modal-btn-none">
        <button type="button" class="tj-modal-btn" data-tipjar-add="0">
          <span class="tj-modal-btn-percentage">No tip</span>
        </button>
      </span>
    </div>
  </div>

  <script>
    var onCartSubmit = function(event) {
      // Show modal
      document.getElementById('tipJarModal').style.display = 'flex';
    }

    var tipJarAddBtns = document.querySelectorAll('[data-tipjar-add]');
    tipJarAddBtns.forEach(function(btn) {
      btn.onclick = function(event) {
        console.log('click event', event);
        var value = parseInt(event.currentTarget.getAttribute('data-tipjar-add'));
        console.log('value', value);

        var tipProductData = {
          updates: {
            {{ all_products['tip-gratuity'].first_available_variant.id }}: value
          }
        };

        fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tipProductData),
        })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
          window.location.href = '/checkout';
        })
        .catch((error) => {
          console.error('Error:', error);
          window.location.href = '/checkout';
        });
      };
    });

    document.addEventListener('submit', function(event) {
      console.log('event', event);
      if (event.target.getAttribute('action') == '/cart' && event.submitter.getAttribute('name') != 'update') {
        event.preventDefault();
        onCartSubmit(event)
      }
    });
  </script>
{% endif %}`
