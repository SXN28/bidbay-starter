<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../store/auth";

const { isAuthenticated, isAdmin, userData, token } = useAuthStore();

const route = useRoute();
const router = useRouter();

const productId = ref(route.params.productId);
const productData = ref(null);
const isLoading = ref(true);
const error = ref(null);
const bidAmount = ref(0);
const remainingTime = ref(null);

// Fonction pour charger les données du produit depuis l'API
async function loadProduct() {
  console.log(productId.value);
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId.value}`);
    console.log(response);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des données du produit");
    }
    productData.value = await response.json();
    // Calculer le temps restant après avoir chargé les données du produit
    calculateRemainingTime();
  } catch (err) {
    console.error(err);
    error.value = "Une erreur est survenue lors du chargement des données du produit.";
  } finally {
    isLoading.value = false;
  }
}

// Appeler la fonction pour charger les données du produit après le montage du composant
onMounted(() => {
  loadProduct();
});

// Calculer le temps restant
function calculateRemainingTime() {
  const endTime = new Date(productData.value.endDate).getTime();
  const currentTime = new Date().getTime();
  const remainingMilliseconds = Math.max(0, endTime - currentTime);
  const remainingHours = Math.floor(remainingMilliseconds / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);
  // Formater le temps restant en format HH:MM:SS
  remainingTime.value = `${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Formater la date
function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}

</script>

<template>
  <div class="row">
    <div class="text-center mt-4" data-test-loading v-if="isLoading">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div class="alert alert-danger mt-4" role="alert" data-test-error v-if="error">
      {{ error }}
    </div>

    <div class="row" data-test-product v-if="productData">
      <div class="col-lg-4">
        <img
          :src="productData && productData.picture ? productData.picture : ''"
          alt=""
          class="img-fluid rounded mb-3"
          data-test-product-picture
        />
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Compte à rebours</h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted" data-test-countdown>
              Temps restant : {{ remainingTime }}
            </h6>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-6">
            <h1 class="mb-3" data-test-product-name>
              {{ productData.name }}
            </h1>
          </div>
          <div class="col-lg-6 text-end">
            <RouterLink
              :to="{ name: 'ProductEdition', params: { productId: productData.id } }"
              class="btn btn-primary"
              data-test-edit-product
            >
              Editer
            </RouterLink>
            &nbsp;
            <button class="btn btn-danger" data-test-delete-product>
              Supprimer
            </button>
          </div>
        </div>

        <h2 class="mb-3">Description</h2>
        <p data-test-product-description>
          {{ productData.description }}
        </p>

        <h2 class="mb-3">Informations sur l'enchère</h2>
        <ul>
          <li data-test-product-price>Prix de départ : {{ productData.startingPrice }} €</li>
          <li data-test-product-end-date>Date de fin : {{ formatDate(productData.endDate) }}</li>
          <li>
            Vendeur :
            <router-link
              :to="{ name: 'User', params: { userId: productData.sellerId } }"
              data-test-product-seller
            >
              {{ productData.sellerName }}
            </router-link>
          </li>
        </ul>

        <h2 class="mb-3">Offres sur le produit</h2>
        <table class="table table-striped" data-test-bids>
          <thead>
            <tr>
              <th scope="col">Enchérisseur</th>
              <th scope="col">Offre</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="productData.bids.length === 0" data-test-no-bids>
              <td colspan="4">Aucune offre pour le moment</td>
            </tr>
            <tr v-else v-for="(bid, index) in productData.bids" :key="index" data-test-bid>
              <td>
                <router-link
                  :to="{ name: 'User', params: { userId: bid.bidderId } }"
                  data-test-bid-bidder
                >
                  {{ bid.bidderName }}
                </router-link>
              </td>
              <td data-test-bid-price>{{ bid.amount }} €</td>
              <td data-test-bid-date>{{ formatDate(bid.date) }}</td>
              <td>
                <button class="btn btn-danger btn-sm" data-test-delete-bid>
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <form data-test-bid-form>
          <div class="form-group">
            <label for="bidAmount">Votre offre :</label>
            <input
              type="number"
              class="form-control"
              id="bidAmount"
              data-test-bid-form-price
              v-model="bidAmount"
            />
            <small class="form-text text-muted">
              Le montant doit être supérieur à 10 €.
            </small>
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="bidAmount <= 10"
            data-test-submit-bid
          >
            Enchérir
          </button>
        </form>
      </div>
    </div>
  </div>
</template>