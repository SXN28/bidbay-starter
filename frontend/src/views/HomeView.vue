<script setup>
import { ref, computed } from "vue";

const loading = ref(false);
const error = ref(false);
const products = ref([]);
const sorterLabel = ref("nom");
const searchQuery = ref("");


const filteredProducts = computed(() => {
  const searchTerm = searchQuery.value.toLowerCase();
  return products.value.filter(product => {
    return product.name.toLowerCase().includes(searchTerm);
  });
});

function sortProductsByName() {
  sorterLabel.value = "nom";
  products.value.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
}

function sortProductsByPrice() {
  products.value.sort((a, b) => {
    sorterLabel.value = "prix";
    return fetchLastBid(a) - fetchLastBid(b);
  });
}

async function fetchProducts() {
  try {
    loading.value = true;
    const response = await fetch("http://localhost:3000/api/products");
    const data = await response.json();

    if (!response.ok || data.length<1) {
      throw new Error(data.error);
    } else {
      console.log(data.length)
      products.value = data;
      console.error("Data récupérée");
      sortProductsByName()
    }
  } catch (e) {
    error.value = true;
    console.error("Une erreur est survenue lors du chargement des produits :", e);
  } finally {
    loading.value = false;
  }
}


function fetchLastBid(product) {
    if (!product || !product.bids || product.bids.length === 0) {
        return product.originalPrice;
    } else {
        const sortedBids = product.bids.sort((a, b) => b.price - a.price);
        return sortedBids[0] ? sortedBids[0].price : null;
    }
}

fetchProducts(); 
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
              type="text"
              class="form-control"
              placeholder="Filtrer par nom"
              data-test-filter
              v-model="searchQuery"
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
            Trier par {{ sorterLabel }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="#" @click="sortProductsByName"> Nom </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click="sortProductsByPrice" data-test-sorter-price>
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-4" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>
    <div v-if="!loading && !error" class="row">
      <div class="col-md-4 mb-4" v-for="item in filteredProducts" data-test-product>
        <div class="card">
          <RouterLink :to="{ name: 'Product', params: { productId: item.id } }">
          <img
            :src="item.pictureUrl"
            data-test-product-picture
          class="card-img-top"/>
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink
                data-test-product-name
                :to="{ name: 'Product', params: { productId: item.id } }">
                {{item.name}}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>
              {{item.description}}
            </p>
            <p class="card-text">
              Vendeur :
              <RouterLink
                data-test-product-seller
                :to="{ name: 'User', params: { userId: item.seller.id } }">
                {{ products[item.id] ? products[item.id].seller.username : 'Chargement...' }}
              </RouterLink>
            </p>
            <p class="card-text" data-test-product-date>
              En cours jusqu'au <br> {{ item.endDate.split('T')[0] }}
            </p>
            <p class="card-text" data-test-product-price>Prix actuel : {{ item.id ? fetchLastBid(item) : 'Chargement...' }} €</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
