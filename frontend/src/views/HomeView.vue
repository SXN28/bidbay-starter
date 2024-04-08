<script setup>
import { ref, computed } from "vue";

const loading = ref(false);
const error = ref(false);
const products = ref([]);

let sortBy = 'name'; // Variable pour suivre le type de tri en cours

function sortByName() {
  sortBy = 'name';
  products.value.sort((a, b) => a.name.localeCompare(b.name));
}

function sortByPrice() {
  sortBy = 'price';
  products.value.sort((a, b) => a.originalPrice - b.originalPrice);
}

let searchTerm = '';

function filterProducts() {
  searchTerm = searchTerm.toLowerCase().trim();
  filteredProducts.value = searchTerm
    ? products.value.filter(product => product.name.toLowerCase().includes(searchTerm))
    : products.value.slice();
}

const filteredProducts = computed(() => {
  if (!searchTerm) {
    return products.value.slice();
  } else {
    return products.value.filter(product => product.name.toLowerCase().includes(searchTerm));
  }
});


async function fetchProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/products/');
    const data = await res.json();
    products.value = data;
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des produits :', error);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

fetchProducts();

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
</script>


<template>
  <div>
    <h1 class="text-center mb-4">Liste des produits</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <form>
          <div class="input-group">
            <span class="input-group-text">Filtrage</span>
            <input
              v-model="searchTerm"
              @input="filterProducts"
              type="text"
              class="form-control"
              placeholder="Filtrer par nom"
              data-test-filter
            />
          </div>
        </form>
      </div>

      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-primary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-test-sorter
          >
            Trier par {{ sortBy === 'name' ? 'nom' : 'prix' }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <!-- Appel des méthodes de tri lorsque les options sont sélectionnées -->
            <li><a class="dropdown-item" href="#" @click="sortByName"> Nom </a></li>
            <li><a class="dropdown-item" href="#" @click="sortByPrice"> Prix </a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 mb-4" v-for="product in filteredProducts" :key="product.id">
        <div class="card">
          <RouterLink :to="{ name: 'Product', params: { productId: product.id } }">
            <img :src="product.pictureUrl" data-test-product-picture class="card-img-top" />
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink :to="{ name: 'Product', params: { productId: product.id } }">
                {{ product.name }}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>{{ product.description }}</p>
            <p class="card-text">
              Vendeur :
              <RouterLink :to="{ name: 'User', params: { userId: product.sellerId } }">
                {{ product.sellerId }}
              </RouterLink>
            </p>
            <p class="card-text" data-test-product-date>En cours jusqu'au {{ formatDate(product.endDate) }}</p>
            <p class="card-text" data-test-product-price>Prix actuel : {{ product.originalPrice }} €</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


