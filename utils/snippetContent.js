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

  <div id="tipJarModal" class="fixed bottom-0 inset-x-0 px-4 pb-4 sm:inset-0 sm:flex sm:items-center sm:justify-center" style="display: none; z-index: 99999">
    <div class="fixed inset-0 transition-opacity">
      <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
    </div>
    <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full px-4 py-3 sm:px-6">
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ tipjar_settings_tipModalTitle }}
            </h3>
            <div class="mt-2">
              <p class="text-sm leading-5 text-gray-500">
                {{ tipjar_settings_tipModalDescription }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 sm:flex">
        {% if tipjar_settings_defaultTipping15 %}
          <span class="mt-3 w-full rounded-md shadow-sm px-2">
            <button type="button" class="w-full rounded-md border border-gray-300 px-4 py-2 bg-white leading-6 text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5" data-tipjar-add="{{ tipjar_cart_total | times: 0.15 }}">
              <span class="block text-3xl font-bold">15%</span>
              <span class="block mt-2 text-lg">{{ tipjar_cart_total | times: 0.15 | money }}</span>
            </button>
          </span>
        {% endif %}
        {% if tipjar_settings_defaultTipping20 %}
          <span class="mt-3 w-full rounded-md shadow-sm px-2">
            <button type="button" class="w-full rounded-md border border-gray-300 px-4 py-2 bg-white leading-6 text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5" data-tipjar-add="{{ tipjar_cart_total | times: 0.20 }}">
              <span class="block text-3xl font-bold">20%</span>
              <span class="block mt-2 text-lg">{{ tipjar_cart_total | times: 0.20 | money }}</span>
            </button>
          </span>
        {% endif %}
        {% if tipjar_settings_defaultTipping25 %}
        <span class="mt-3 w-full rounded-md shadow-sm px-2">
          <button type="button" class="w-full rounded-md border border-gray-300 px-4 py-2 bg-white leading-6 text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5" data-tipjar-add="{{ tipjar_cart_total | times: 0.25 }}">
            <span class="block text-3xl font-bold">25%</span>
            <span class="block mt-2 text-lg">{{ tipjar_cart_total | times: 0.25 | money }}</span>
          </button>
        </span>
        {% endif %}
      </div>
      
      <span class="block mt-3 w-full rounded-md shadow-sm px-2">
        <button type="button" class="w-full rounded-md border border-gray-300 px-4 py-2 bg-white leading-6 text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5" data-tipjar-add="0">
          <span class="block text-xl font-bold">No tip</span>
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
        // productid: 33455105605763

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
      if (event.target.getAttribute('action').indexOf('/cart') > -1) {
        event.preventDefault();
        onCartSubmit(event)
      }
    });
  </script>
{% endif %}`
