(async function() {
    'use strict';

    // 1. CDN Concatenado Dinámico Institucional Anti-CORS de Firebase v10.12.0
    const cdn = 'h' + 't' + 't' + 'p' + 's' + ':' + '/' + '/' + 'w' + 'w' + 'w' + '.' + 'g' + 's' + 't' + 'a' + 't' + 'i' + 'c' + '.' + 'c' + 'o' + 'm' + '/f' + 'i' + 'r' + 'e' + 'b' + 'a' + 's' + 'e' + 'j' + 's' + '/10.12.0/';
    
    const { db } = await import('./firebase-config.js');
    const { doc, getDoc, collection, getDocs, query, where, orderBy } = await import(cdn + 'firebase-firestore.js');

    // Captura de elementos del DOM mapeados al nuevo esqueleto de 3 franjas
    const statusCarga = document.getElementById('statusCargaHistorial');
    const contenedorTimeline = document.getElementById('contenedorTimelineAuditoria');
    const listaTarjetasAnios = document.getElementById('listaEventosTimeline');
    const visorBoletinContenedor = document.getElementById('visorBoletinContenedor');

    // Leer los parámetros de la URL
    const parametrosUrl = new URLSearchParams(window.location.search);
    const dniEstudiante = parametrosUrl.get('dni');

    if (!dniEstudiante) {
        statusCarga.innerHTML = `<p class="text-sm text-rose-400 font-medium">⚠️ Error de acceso: No se especificó ningún DNI de estudiante para auditar.</p>`;
        return;
    }

    // Llaves unívocas de contexto para la Aduana Local Cifrada (Pilar 2 y 3)
    const CACHE_KEY_ALUMNO = `haspen_auditoria_alumno_${dniEstudiante}`;
    const CACHE_KEY_EVENTOS = `haspen_auditoria_eventos_${dniEstudiante}`;

    try {
        let alumno = null;
        let todosLosEventosBici = [];

        // ---------------------------------------------------------------------------------
        // 🔒 ADUANA LOCAL PREFERENTE: ESCUDO DE CUOTAS DE ACCESO (Pilar 2)
        // ---------------------------------------------------------------------------------
        const cacheAlumnoLocal = localStorage.getItem(CACHE_KEY_ALUMNO);
        const cacheEventosLocal = localStorage.getItem(CACHE_KEY_EVENTOS);

        if (cacheAlumnoLocal && cacheEventosLocal) {
            console.log("[Aduana Local] Cache Hit exitoso. Descifrando trayectoria...");
            alumno = JSON.parse(decodeURIComponent(atob(cacheAlumnoLocal)));
            todosLosEventosBici = JSON.parse(decodeURIComponent(atob(cacheEventosLocal)));
               } else {
            console.log("[Aduana Local] Cache Miss. Consultando red Cloud Firestore...");
            
            // Consulta de Alumno
            const alumnoSnap = await getDoc(doc(db, "alumnos", dniEstudiante));
            if (!alumnoSnap.exists()) {
                statusCarga.innerHTML = `<p class="text-sm text-rose-400 font-medium">⚠️ El legajo digital con DNI ${dniEstudiante} no existe en los registros.</p>`;
                return;
            }
            alumno = alumnoSnap.data();

            // Mapeo adaptativo de curso en red
            let cursoEstudianteText = "Mesa de Entrada / Pendiente";
            if (alumno.cursoId) {
                const cursoSnap = await getDoc(doc(db, "cursos", alumno.cursoId));
                if (cursoSnap.exists()) {
                    const cData = cursoSnap.data();
                    cursoEstudianteText = `${cData.ciclo || "1°"} "${cData.division || "A"}" (${cData.turno || "Mañana"})`;
                }
            }
            alumno.cursoTextoMapeado = cursoEstudianteText;

            // CONSULTA PARALELA COMPUESTA (Protección de rendimiento de red)
            const eventosRef = collection(db, "historial_eventos");
            const consultaEstructurada = query(eventosRef, where("dni_alumno", "==", dniEstudiante), orderBy("fecha_hora", "desc"));
            
            const calificacionesRef = collection(db, "alumnos_calificaciones");
            const consultaCalificaciones = query(calificacionesRef, where("alumnoDni", "==", String(dniEstudiante).trim()));

            const [querySnapshot, snapCalificaciones] = await Promise.all([
                getDocs(consultaEstructurada),
                getDocs(consultaCalificaciones)
            ]);

            if (typeof window.actualizarContadoresMonitor === "function") {
                window.actualizarContadoresMonitor("firebase_lectura", querySnapshot.size + snapCalificaciones.size + 2);
            }

            // 1. Cargar registros forenses originales
            querySnapshot.forEach(docSnap => {
                todosLosEventosBici.push({ id: docSnap.id, fuenteColeccion: "historial_eventos", ...docSnap.data() });
            });

                       // 2. Cargar calificaciones oficiales transformándolas al formato compatible con el Informe Pedagógico
            snapCalificaciones.forEach(docSnap => {
                const cData = docSnap.data();
                const notasHub = cData.notes || cData.notas || {};
                const t1 = notasHub.trim1 || {};
                const t2 = notasHub.trim2 || {};

                todosLosEventosBici.push({
                    id: docSnap.id,
                    fuenteColeccion: "alumnos_calificaciones",
                    dni_alumno: dniEstudiante,
                    ciclo_lectivo: cData.cicloLectivo || alumno.cicloLectivo || new Date().getFullYear().toString(),
                    fecha_hora: new Date().toISOString(),
                    operador_nombre: "Carga Académica",
                    categoria: "CALIFICACIONES",
                    subcategoria: "Boletín Oficial",
                    descripcion: `Materia: ${cData.materia || "General"}`,
                    datos_duros: {
                        materia: cData.materia,
                        // Mapeo simétrico de sub-periodos extraído del motor oficial del establecimiento
                        c1_inf1: t1.n1 !== null && t1.n1 !== undefined && t1.n1 !== "" ? String(t1.n1) : "-",
                        c1_inf2: t1.n2 !== null && t1.n2 !== undefined && t1.n2 !== "" ? String(t1.n2) : "-",
                        c1_forta: t1.ef !== null && t1.ef !== undefined && t1.ef !== "" ? String(t1.ef) : "-",
                        c1_nota: cData.notaCuatrimestre1 !== null && cData.notaCuatrimestre1 !== undefined && cData.notaCuatrimestre1 !== "" ? String(cData.notaCuatrimestre1) : "-",
                        
                        c2_inf1: t2.n1 !== null && t2.n1 !== undefined && t2.n1 !== "" ? String(t2.n1) : "-",
                        c2_inf2: t2.n2 !== null && t2.n2 !== undefined && t2.n2 !== "" ? String(t2.n2) : "-",
                        c2_forta: t2.ef !== null && t2.ef !== undefined && t2.ef !== "" ? String(t2.ef) : "-",
                        c2_nota: cData.notaCuatrimestre2 !== null && cData.notaCuatrimestre2 !== undefined && cData.notaCuatrimestre2 !== "" ? String(cData.notaCuatrimestre2) : "-",
                        
                        nota_final: cData.notaFinal !== null && cData.notaFinal !== undefined && cData.notaFinal !== "" ? String(cData.notaFinal) : "-"
                    }
                });
            });


            // Guardado inmediato y ofuscado simétrico local (Blindaje Atómico - Pilar 4)
            localStorage.setItem(CACHE_KEY_ALUMNO, btoa(encodeURIComponent(JSON.stringify(alumno))));
            localStorage.setItem(CACHE_KEY_EVENTOS, btoa(encodeURIComponent(JSON.stringify(todosLosEventosBici))));
        }


        // ---------------------------------------------------------------------------------
        // 🏢 POBLADO DE LA FRANJA HORIZONTAL SUPERIOR 1 (LEGAJO ADMINISTRATIVO)
        // ---------------------------------------------------------------------------------
        document.getElementById('nombreAlumnoHistorial').textContent = alumno.nombre || "Sin registrar";
        document.getElementById('dniAlumnoHistorial').textContent = dniEstudiante;
        document.getElementById('cursoAlumnoHistorial').textContent = alumno.cursoTextoMapeado;
        document.getElementById('cicloAlumnoHistorial').textContent = alumno.cicloLectivo || new Date().getFullYear().toString();
        
        // CORRECCIÓN INTERFAZ: Control de Orientación Académica (Tarjeta 1)
        const elementoOrientacion = document.getElementById('orientacionAlumnoHistorial');
        if (elementoOrientacion) {
            const idCursoEstructural = String(alumno.cursoId || "").trim();
            const primerCaracterAnio = idCursoEstructural.charAt(0); // Extrae el número de año (ej: "1", "4")
            
            if (["1", "2", "3"].includes(primerCaracterAnio)) {
                elementoOrientacion.textContent = "Ciclo Básico";
            } else if (["4", "5", "6"].includes(primerCaracterAnio)) {
                elementoOrientacion.textContent = alumno.orientacion || "No asignada";
            } else {
                elementoOrientacion.textContent = alumno.orientacion || "Ciclo Básico";
            }
        }
        
        // CORRECCIÓN INTERFAZ: Fecha de Inscripción Original (Tarjeta 2 - Registro de Matrícula)
        const elementoFechaInscripcion = document.getElementById('fechaInscripcionHistorial');
        if (elementoFechaInscripcion) {
            if (alumno.fechaInscripcion && alumno.fechaInscripcion.trim() !== "") {
                // Inyecta la fecha exacta del legajo digital de Firestore
                elementoFechaInscripcion.textContent = alumno.fechaInscripcion.trim();
            } else {
                // Fallback seguro si el campo viene vacío o sin registrar en la base de datos
                elementoFechaInscripcion.textContent = "Pendiente de Carga en Formulario de Alta";
            }
        }




        // ---------------------------------------------------------------------------------
        // 🔍 ESCÁNER REACTIVO DE FALTANTES Y AUDITORÍA DE LEGAJO (REEMPLAZO FORENSE)
        // ---------------------------------------------------------------------------------
        const listaFaltantes = [];

        // 1. Verificación de Campos Administrativos Esenciales
        if (!alumno.cuil || alumno.cuil.trim() === "") listaFaltantes.push("Falta CUIL del estudiante");
        if (!alumno.direccion || alumno.direccion.trim() === "") listaFaltantes.push("Falta Dirección de residencia");
        if (!alumno.telefono1 || alumno.telefono1.trim() === "") listaFaltantes.push("Falta Teléfono principal");
        if (!alumno.nombreTutor || alumno.nombreTutor.trim() === "") listaFaltantes.push("Falta registrar Adulto Responsable / Tutor");
        if (!alumno.dniTutor || alumno.dniTutor.trim() === "") listaFaltantes.push("Falta DNI del Tutor");

        // 2. Verificación del Mapa de Documentación Digitalizada Obligatoria
        const docsDigitales = alumno.documentosDigitales || {};
        
        // Diccionario de traducción semántica de archivos del Colegio HASPEN
        const traductorDocumentos = {
            dni_alumno: "DNI frente/dorso del estudiante",
            partida_nac: "Partida de Nacimiento",
            cert_primaria: "Certificado de Primaria aprobada",
            buena_salud: "Certificado de Buena Salud vigente",
            carnet_vacunas: "Carnet de Vacunación",
            dni_tutor: "DNI frente/dorso del Tutor"
        };

        Object.keys(traductorDocumentos).forEach(llaveDoc => {
            if (!docsDigitales[llaveDoc] || docsDigitales[llaveDoc] === null || docsDigitales[llaveDoc] === "null") {
                listaFaltantes.push(`Falta adjuntar: ${traductorDocumentos[llaveDoc]}`);
            }
        });

        // 3. Verificaciones Especiales Condicionales de Inclusión (PPI / CUD)
        if (alumno.tienePPI === true || alumno.tienePPI === "true") {
            if (!docsDigitales.acta_ppi) listaFaltantes.push("Falta adjuntar el Acta/Resolución PPI obligatoria");
        }
        if (alumno.tieneCUD === true || alumno.tieneCUD === "true") {
            if (!docsDigitales.acta_cud) listaFaltantes.push("Falta adjuntar el Certificado Único de Discapacidad (CUD)");
        }

        // 4. Renderizado y Mutación de la Interfaz Física
        const tarjetaAlerta = document.getElementById('tarjetaEstadoLegajoAlerta');
        const textoAlerta = document.getElementById('textoAlertaLegajo');
        const badgeRiesgo = document.getElementById('badgeRiesgoGlobal');

        // Modificación dinámica del título superior del bloque para consistencia institucional
        const tituloBloqueForense = tarjetaAlerta.querySelector('h3') || tarjetaAlerta.previousElementSibling;
        if (tituloBloqueForense && tituloBloqueForense.tagName.startsWith('H')) {
            tituloBloqueForense.textContent = "Estado Forense del Legajo";
        }

        if (listaFaltantes.length > 0) {
            // Estado: Legajo Incompleto (Estilo Alerta)
            tarjetaAlerta.className = "tarjeta-legajo-alerta";
            badgeRiesgo.style.background = "#fce8e6";
            badgeRiesgo.style.color = "#c5221f";
            badgeRiesgo.textContent = `${listaFaltantes.length} Pendientes`;

            // Construcción estructurada de viñetas legibles
            let htmlPendientes = `<div style="font-weight: bold; margin-bottom: 6px; color: #b91c1c;">⚠ Datos y Documentación faltante en el legajo digital:</div>`;
            htmlPendientes += `<ul style="margin: 0; padding-left: 16px; font-size: 11px; line-height: 1.5; color: #4b5563;">`;
            listaFaltantes.forEach(item => {
                htmlPendientes += `<li style="margin-bottom: 2px;">${item}</li>`;
            });
            htmlPendientes += `</ul>`;
            
            textoAlerta.innerHTML = htmlPendientes;
        } else {
            // Estado: Legajo 100% Auditado y Completo (Estilo Crítico/Éxito)
            tarjetaAlerta.className = "tarjeta-legajo-critica";
            badgeRiesgo.style.background = "#e6f4ea";
            badgeRiesgo.style.color = "#137333";
            badgeRiesgo.textContent = "Completo";
            textoAlerta.innerHTML = "✅ El legajo digital de este estudiante cuenta con todos los campos administrativos requeridos y documentación respaldatoria al día.";
        }

        // Ocultar spinner y mostrar panel principal unificado
        statusCarga.style.display = 'none';
        contenedorTimeline.style.display = 'flex';

        // Estructura cronológica fija obligatoria (1° a 6° Año)
        const estructuraCronologicaAños = [
            { id: "1", nombre: "1° Año", baseAnio: 2018 },
            { id: "2", nombre: "2° Año", baseAnio: 2019 },
            { id: "3", nombre: "3° Año", baseAnio: 2020 },
            { id: "4", nombre: "4° Año", baseAnio: 2021 },
            { id: "5", nombre: "5° Año", baseAnio: 2022 },
            { id: "6", nombre: "6° Año", baseAnio: 2023 }
        ];

        // ---------------------------------------------------------------------------------
        // 📊 MOTOR DE REDIBUJADO EVOLUCIONADO: TRAYECTORIAS REALES Y REPITENCIAS (Pilar 5)
        // ---------------------------------------------------------------------------------
        function dibujarTarjetasTrayectoria() {
            listaTarjetasAnios.innerHTML = "";
            let htmlBandaMedia = "";

            // 1. Determinar los extremos cronológicos de la historia del alumno
            const anioActualSistema = parseInt(alumno.cicloLectivo) || 2026;
            
            // Extraer todos los años calendario donde el alumno tenga alguna actividad real en nuestra base
            const aniosConEvidencia = todosLosEventosBici.map(ev => {
                return ev.ciclo_lectivo ? parseInt(ev.ciclo_lectivo) : null;
            }).filter(a => a !== null);

            // Deducir el año de inicio (mínimo encontrado, o año de inscripción, o cálculo inverso estándar)
            let anioInicioRef = anioActualSistema;
            if (alumno.fechaInscripcion && alumno.fechaInscripcion.includes("/")) {
                const partesFecha = alumno.fechaInscripcion.split("/");
                const anioInsc = parseInt(partesFecha[partesFecha.length - 1]);
                if (!isNaN(anioInsc)) anioInicioRef = anioInsc;
            }
            if (aniosConEvidencia.length > 0) {
                const minEvidencia = Math.min(...aniosConEvidencia);
                if (minEvidencia < anioInicioRef) anioInicioRef = minEvidencia;
            }

            // Asegurar un rango coherente (mínimo un barrido lineal desde su inicio teórico hasta el año actual)
            const rangoAniosCronologicos = [];
            for (let a = anioInicioRef; a <= anioActualSistema; a++) {
                rangoAniosCronologicos.push(a);
            }

            // 2. Procesar año por año calendario de forma secuencial (Soporta ilimitadas tarjetas por repitencia)
            rangoAniosCronologicos.forEach(anioCalendarioLoop => {
                
                // Filtrado adaptativo en memoria nativa (Pilar 2) para este año calendario específico
                const registrosAnio = todosLosEventosBici.filter(ev => {
                    const cLectivo = ev.ciclo_lectivo ? ev.ciclo_lectivo.toString() : "";
                    return cLectivo === anioCalendarioLoop.toString();
                });

                // Separar registros académicos de alertas administrativas
                const registrosNotas = registrosAnio.filter(ev => ev.fuenteColeccion === "alumnos_calificaciones" || ev.categoria === "CALIFICACIONES");
                const registrosAlertas = registrosAnio.filter(ev => ev.fuenteColeccion === "historial_eventos" && ev.categoria !== "CALIFICACIONES");

                // --- ESCENARIO A: EL AÑO ESTÁ VACÍO (CICLO EN OTRO COLEGIO) ---
                if (registrosAnio.length === 0) {
                    const colorBorde = "#cbd5e1"; // Gris
                    const badgeTexto = "Externo";
                    const badgeEstilo = "background: #f1f5f9; color: #475569; font-weight: bold;";

                    htmlBandaMedia += `
                    <div class="tarjeta-anio-cronologica" data-anio-calendario="${anioCalendarioLoop}" style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; border-top: 4px solid ${colorBorde}; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; min-height: 170px; width: 240px; box-sizing: border-box; opacity: 0.85; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div>
                            <div style="font-size: 14px; font-weight: 800; color: #475569; margin-bottom: 2px;">Ciclo en Otro</div>
                            <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Ciclo Lectivo: <b>${anioCalendarioLoop}</b></div>
                            <div style="font-size: 11px; color: #94a3b8; font-style: italic; line-height: 1.4; margin-top: 10px;">
                                ℹ️ No se registran movimientos ni calificaciones oficiales en HASPEN. Trayectoria cursada en otra institución.
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 11px;">
                            <span style="color: #64748b;">Estado:</span>
                            <span style="padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; ${badgeEstilo}">${badgeTexto}</span>
                        </div>
                    </div>`;
                    return; // Saltar al siguiente año
                }
                // --- ESCENARIO B: EL AÑO TIENE EVIDENCIA (REGULAR / REPITENTE) ---
                // Deducir el curso real que hizo el alumno en este año basándonos en los datos duros de las notas
                let cursoDetectadoId = "1";
                let cursoDetectadoNombre = "1° Año";

                if (registrosNotas.length > 0) {
                    const primerRegistro = registrosNotas[0];
                    const idCursoDuro = primerRegistro.datos_duros ? String(primerRegistro.datos_duros.curso) : "";
                    
                    if (idCursoDuro.includes("2") || idCursoDuro.includes("2°")) { cursoDetectadoId = "2"; cursoDetectadoNombre = "2° Año"; }
                    else if (idCursoDuro.includes("3") || idCursoDuro.includes("3°")) { cursoDetectadoId = "3"; cursoDetectadoNombre = "3° Año"; }
                    else if (idCursoDuro.includes("4") || idCursoDuro.includes("4°")) { cursoDetectadoId = "4"; cursoDetectadoNombre = "4° Año"; }
                    else if (idCursoDuro.includes("5") || idCursoDuro.includes("5°")) { cursoDetectadoId = "5"; cursoDetectadoNombre = "5° Año"; }
                    else if (idCursoDuro.includes("6") || idCursoDuro.includes("6°")) { cursoDetectadoId = "6"; cursoDetectadoNombre = "6° Año"; }
                } else {
                    if (anioCalendarioLoop === anioActualSistema) {
                        const textoCurso = (alumno.cursoTextoMapeado || "").toLowerCase();
                        if (textoCurso.includes("2°")) { cursoDetectadoId = "2"; cursoDetectadoNombre = "2° Año"; }
                        else if (textoCurso.includes("3°")) { cursoDetectadoId = "3"; cursoDetectadoNombre = "3° Año"; }
                        else if (textoCurso.includes("4°")) { cursoDetectadoId = "4"; cursoDetectadoNombre = "4° Año"; }
                        else if (textoCurso.includes("5°")) { cursoDetectadoId = "5"; cursoDetectadoNombre = "5° Año"; }
                        else if (textoCurso.includes("6°")) { cursoDetectadoId = "6"; cursoDetectadoNombre = "6° Año"; }
                    }
                }

                // Regla de Negocio: Orientación Básica (1° a 3°) o Especialidad del legajo (4° a 6°)
                let etiquetaOrientacion = "Básico";
                if (["4", "5", "6"].includes(cursoDetectadoId)) {
                    etiquetaOrientacion = alumno.orientacion || "Orientado";
                }

                const tieneAlertaAnual = registrosAlertas.some(ev => ev.categoria === "OBSERVACION" || ev.subcategoria === "Modificación de Nota" || ev.subcategoria === "MODIFICACION_LEGAJO");
                
                // Mapeo adaptativo de notas en memoria
                let poolNotas = registrosNotas.map(ev => {
                    const dDuros = ev.datos_duros || {};
                    const nFinal = ev.notaFinal || dDuros.notaFinal || dDuros.notaNueva || dDuros.nota || 0;
                    return parseFloat(nFinal);
                }).filter(n => n > 0);

                let sumaNotas = poolNotas.reduce((a, b) => a + b, 0);
                let promedio = poolNotas.length > 0 ? (sumaNotas / poolNotas.length).toFixed(2) : "0.00";

                // Cálculo reglamentario de materias (Aprobación >= 6)
                let totalMaterias = registrosNotas.length;
                let desaprobadas = registrosNotas.filter(ev => {
                    const dDuros = ev.datos_duros || {};
                    const nFinal = parseFloat(ev.notaFinal || dDuros.notaFinal || dDuros.notaNueva || dDuros.nota || 0);
                    return nFinal > 0 && nFinal < 6;
                }).length;
                
                let aprobadas = totalMaterias - desaprobadas;
                let previas = desaprobadas;

                // Semáforo de Riesgo Académico Institucional Inteligente (Cargas parciales de prueba)
                let colorBorde = "#10b981"; // Verde (Bajo por defecto)
                let badgeTexto = "Bajo";
                let badgeEstilo = "background: #e6f4ea; color: #137333;";

                if (previas > 2) {
                    colorBorde = "#ef4444"; // Rojo
                    badgeTexto = "Alto";
                    badgeEstilo = "background: #fce8e6; color: #c5221f; font-weight: bold;";
                } else if (previas > 0 && previas <= 2) {
                    colorBorde = "#ea580c"; // Naranja
                    badgeTexto = "Medio";
                    badgeEstilo = "background: #fff7ed; color: #c2410c; font-weight: bold;";
                } else if (parseFloat(promedio) >= 6.00 && desaprobadas === 0) {
                    // Salvaguarda: Alumno regular sin aplazos con notas parciales
                    colorBorde = "#10b981"; 
                    badgeTexto = "Bajo";
                    badgeEstilo = "background: #e6f4ea; color: #137333;";
                }

                htmlBandaMedia += `
                <div class="tarjeta-anio-cronologica" data-anio-id="${cursoDetectadoId}" data-anio-nombre="${cursoDetectadoNombre}" data-anio-calendario="${anioCalendarioLoop}" style="background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; border-top: 4px solid ${colorBorde}; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; min-height: 170px; width: 240px; box-sizing: border-box; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div>
                        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cursoDetectadoNombre} - ${etiquetaOrientacion}">
                            ${cursoDetectadoNombre} - <span style="font-weight: 500; color: #475569;">${etiquetaOrientacion}</span>
                        </div>
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Ciclo Lectivo: <b>${anioCalendarioLoop}</b></div>
                        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569;">
                            <div style="display: flex; justify-content: space-between;"><span>Aprobadas:</span><b style="color: #10b981;">${aprobadas}</b></div>
                            <div style="display: flex; justify-content: space-between;"><span>Desaprobadas:</span><b style="${desaprobadas > 0 ? 'color: #ef4444;' : ''}">${desaprobadas}</b></div>
                            <div style="display: flex; justify-content: space-between;"><span>Previas:</span><b style="${previas > 0 ? 'color: #ea580c;' : ''}">${previas}</b></div>
                            <div style="display: flex; justify-content: space-between; margin-top: 2px; padding-top: 2px; border-top: 1px dashed #f1f5f9;"><span>Promedio:</span><strong>${promedio}</strong></div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 11px;">
                        <span style="color: #64748b;">Riesgo:</span>
                        <span style="padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; ${badgeEstilo}">${badgeTexto}</span>
                    </div>
                </div>`;
            });

            // Forzar Flexbox contenedor fluido alineado a la izquierda para evitar deformaciones
            listaTarjetasAnios.style.display = "flex";
            listaTarjetasAnios.style.flexWrap = "wrap";
            listaTarjetasAnios.style.gap = "16px";
            listaTarjetasAnios.style.justifyContent = "flex-start";
            listaTarjetasAnios.innerHTML = htmlBandaMedia;

            // Asociar eventos de click para abrir el visor de boletín inferior (solo tarjetas con datos locales)
            document.querySelectorAll('.tarjeta-anio-cronologica').forEach(tarjeta => {
                tarjeta.addEventListener('click', function() {
                    const anioId = this.getAttribute('data-anio-id');
                    const anioNombre = this.getAttribute('data-anio-nombre');
                    const anioCalendario = this.getAttribute('data-anio-calendario');
                    
                    if (!anioId) return;

                    if (typeof window.activarFocoTarjetaAño === 'function') {
                        window.activarFocoTarjetaAño(this, `${anioNombre} (${anioCalendario})`);
                    }
                    renderizarBoletinInferior(anioId, anioCalendario);
                });
            });
        }



        // ---------------------------------------------------------------------------------
        // 📋 VISOR DETALLADO: FRANJA HORIZONTAL INFERIOR 3 (BOLETINES POR AÑO)
        // ---------------------------------------------------------------------------------
        function renderizarBoletinInferior(anioId, anioCalendario) {
            visorBoletinContenedor.innerHTML = "";

            const eventosCiclo = todosLosEventosBici.filter(ev => {
                const cLectivo = ev.ciclo_lectivo ? ev.ciclo_lectivo.toString() : "";
                return cLectivo.includes(anioCalendario.toString()) || (ev.datos_duros && String(ev.datos_duros.curso).includes(anioId));
            });

            const registrosNotas = eventosCiclo.filter(ev => ev.fuenteColeccion === "alumnos_calificaciones" || ev.categoria === "CALIFICACIONES");

            if (registrosNotas.length === 0) {
                visorBoletinContenedor.innerHTML = `
                <div style="text-align: center; color: #94a3b8; padding: 32px; font-size: 0.85rem; font-family: monospace;">
                    ⚠️ No se registran calificaciones oficiales cargadas en las actas digitales para el ciclo lectivo ${anioCalendario}.
                </div>`;
                return;
            }

            // ---------------------------------------------------------------------------------
            // 📊 MOTOR ANALÍTICO EVALUADO EN MEMORIA LOCAL (PERIODIZACIÓN PEDAGÓGICA)
            // ---------------------------------------------------------------------------------
            let sumC1 = 0, countC1 = 0, aprobadasC1 = 0;
            let sumC2 = 0, countC2 = 0, aprobadasC2 = 0;
            let sumFinal = 0, countFinal = 0, aprobadasFinal = 0;
            let alertasCriticas = 0;

            registrosNotas.forEach(ev => {
                const d = ev.datos_duros || {};
                
                // Procesar Notas de Cierre de 1° Cuatrimestre
                const nC1 = parseFloat(d.c1_nota || 0);
                if (!isNaN(nC1) && nC1 > 0) {
                    sumC1 += nC1;
                    countC1++;
                    if (nC1 >= 6) aprobadasC1++;
                    else alertasCriticas++;
                }

                // Procesar Notas de Cierre de 2° Cuatrimestre
                const nC2 = parseFloat(d.c2_nota || 0);
                if (!isNaN(nC2) && nC2 > 0) {
                    sumC2 += nC2;
                    countC2++;
                    if (nC2 >= 6) aprobadasC2++;
                    else alertasCriticas++;
                }

                // Procesar Notas Finales de Cierre de Ciclo
                const nFinal = parseFloat(d.nota_final || 0);
                if (!isNaN(nFinal) && nFinal > 0) {
                    sumFinal += nFinal;
                    countFinal++;
                    if (nFinal >= 6) aprobadasFinal++;
                }
            });

            const promC1 = countC1 > 0 ? (sumC1 / countC1).toFixed(2) : "0.00";
            const promC2 = countC2 > 0 ? (sumC2 / countC2).toFixed(2) : "0.00";
            const promFinal = countFinal > 0 ? (sumFinal / countFinal).toFixed(2) : "0.00";

            const pctC1 = countC1 > 0 ? Math.round((aprobadasC1 / countC1) * 100) : 0;
            const pctC2 = countC2 > 0 ? Math.round((aprobadasC2 / countC2) * 100) : 0;
            const pctFinal = countFinal > 0 ? Math.round((aprobadasFinal / countFinal) * 100) : 0;

            // ---------------------------------------------------------------------------------
            // 🎨 CONSTRUCCIÓN DE COMPONENTES VISUALES EN SUB-BLOQUES DE LA FRANJA 3
            // ---------------------------------------------------------------------------------
            let htmlEstructura = `
            <div style="width: 100%; display: flex; flex-direction: column; gap: 20px; font-family: system-ui, -apple-system, sans-serif;">
                
                <!-- SUB-BLOQUE 1: INDICADORES ESTADÍSTICOS POR PERIODO -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                    
                    <!-- Tarjeta Métricas 1° Cuatrimestre -->
                    <div style="background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; border-top: 4px solid #3b82f6; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                            <span>📈 1° Cuatrimestre</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #334155;">
                            <div style="display: flex; justify-content: space-between;"><span>Promedio Parcial:</span><strong>${promC1}</strong></div>
                            <div style="display: flex; justify-content: space-between;"><span>Acreditación:</span><strong>${pctC1}% (${aprobadasC1}/${countC1})</strong></div>
                        </div>
                        <div style="width: 100%; background-color: #f1f5f9; height: 6px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                            <div style="width: ${pctC1}%; background-color: #3b82f6; height: 100%; transition: width 0.4s ease;"></div>
                        </div>
                    </div>

                    <!-- Tarjeta Métricas 2° Cuatrimestre -->
                    <div style="background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; border-top: 4px solid #f59e0b; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                            <span>📈 2° Cuatrimestre</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #334155;">
                            <div style="display: flex; justify-content: space-between;"><span>Promedio Parcial:</span><strong>${promC2}</strong></div>
                            <div style="display: flex; justify-content: space-between;"><span>Acreditación:</span><strong>${pctC2}% (${aprobadasC2}/${countC2})</strong></div>
                        </div>
                        <div style="width: 100%; background-color: #f1f5f9; height: 6px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                            <div style="width: ${pctC2}%; background-color: #f59e0b; height: 100%; transition: width 0.4s ease;"></div>
                        </div>
                    </div>

                    <!-- Tarjeta Métricas de Cierre Final -->
                    <div style="background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; border-top: 4px solid #10b981; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                            <span>🎯 Rendimiento General Anual</span>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #334155;">
                            <div style="display: flex; justify-content: space-between;"><span>Promedio General:</span><strong style="color: #0f172a; font-size: 13px;">${promFinal}</strong></div>
                            <div style="display: flex; justify-content: space-between;"><span>Materias Promocionadas:</span><strong>${pctFinal}% (${aprobadasFinal}/${countFinal})</strong></div>
                        </div>
                        <div style="width: 100%; background-color: #f1f5f9; height: 6px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                            <div style="width: ${pctFinal}%; background-color: #10b981; height: 100%; transition: width 0.4s ease;"></div>
                        </div>
                    </div>

                </div>
                <!-- SUB-BLOQUE 2: GRILLA INSTITUCIONAL MATRICIAL COMPLETA -->
                <div style="width: 100%; overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace; color: #334155; text-align: center; background: #ffffff; min-width: 800px;">
                        <thead>
                            <tr style="background: #1b4d82; color: #ffffff; text-transform: uppercase; font-size: 11px; height: 32px;">
                                <th rowspan="2" style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; width: 30%;">Espacio Curricular / Asignatura</th>
                                <th colspan="4" style="border: 1px solid #cbd5e1; background: #1e40af;">1° Cuatrimestre</th>
                                <th colspan="4" style="border: 1px solid #cbd5e1; background: #b45309;">2° Cuatrimestre</th>
                                <th rowspan="2" style="padding: 10px; border: 1px solid #cbd5e1; background: #475569; width: 10%;">Final</th>
                            </tr>
                            <tr style="background: #ffffff; color: #1e293b; font-weight: bold; height: 30px;">
                                <th style="border: 1px solid #cbd5e1; width: 7%;">1° INF</th>
                                <th style="border: 1px solid #cbd5e1; width: 7%;">2° INF</th>
                                <th style="border: 1px solid #cbd5e1; width: 7%;">FORTA.</th>
                                <th style="border: 1px solid #cbd5e1; background: #e0f2fe; color: #0369a1; width: 8%;">1° CUATRI</th>
                                <th style="border: 1px solid #cbd5e1; width: 7%;">1° INF</th>
                                <th style="border: 1px solid #cbd5e1; width: 7%;">2° INF</th>
                                <th style="border: 1px solid #cbd5e1; width: 7%;">FORTA.</th>
                                <th style="border: 1px solid #cbd5e1; background: #fef3c7; color: #b45309; width: 8%;">2° CUATRI</th>
                            </tr>
                        </thead>
                        <tbody>`;

            registrosNotas.forEach(ev => {
                const dExtra = ev.datos_duros || {};
                const materiaStr = dExtra.materia || ev.descripcion || "Materia General";
                
                // Normalización de ceros y guiones en sintonía con el protocolo escolar
                const inf1_1 = dExtra.c1_inf1 && dExtra.c1_inf1 !== "0" ? dExtra.c1_inf1 : "-";
                const inf1_2 = dExtra.c1_inf2 && dExtra.c1_inf2 !== "0" ? dExtra.c1_inf2 : "-";
                const forta1 = dExtra.c1_forta && dExtra.c1_forta !== "0" ? dExtra.c1_forta : "-";
                const notaC1  = dExtra.c1_nota  && dExtra.c1_nota  !== "0" ? dExtra.c1_nota  : "-";
                
                const inf2_1 = dExtra.c2_inf1 && dExtra.c2_inf1 !== "0" ? dExtra.c2_inf1 : "-";
                const inf2_2 = dExtra.c2_inf2 && dExtra.c2_inf2 !== "0" ? dExtra.c2_inf2 : "-";
                const forta2 = dExtra.c2_forta && dExtra.c2_forta !== "0" ? dExtra.c2_forta : "-";
                const notaC2  = dExtra.c2_nota  && dExtra.c2_nota  !== "0" ? dExtra.c2_nota  : "-";
                
                const finalNota = dExtra.nota_final && dExtra.nota_final !== "0" ? dExtra.nota_final : "-";

                // Estilizado dinámico condicional de filas
                const tieneAplazo = parseFloat(finalNota) < 6;
                const estiloFila = tieneAplazo ? "background-color: #fdf2f2;" : "background-color: #ffffff;";

                htmlEstructura += `
                <tr style="${estiloFila} border-bottom: 1px solid #e2e8f0; height: 32px;">
                    <td style="padding: 8px 10px; border: 1px solid #e2e8f0; text-align: left; font-weight: bold; color: #1e293b; text-transform: uppercase;">${materiaStr}</td>
                    <td style="border: 1px solid #e2e8f0; color: #475569;">${inf1_1}</td>
                    <td style="border: 1px solid #e2e8f0; color: #475569;">${inf1_2}</td>
                    <td style="border: 1px solid #e2e8f0; color: #475569;">${forta1}</td>
                    <td style="border: 1px solid #e2e8f0; background: #f0f9ff; font-weight: bold; color: #0369a1; font-size: 13px;">${notaC1}</td>
                    <td style="border: 1px solid #e2e8f0; color: #475569;">${inf2_1}</td>
                    <td style="border: 1px solid #e2e8f0; color: #475569;">${inf2_2}</td>
                    <td style="border: 1px solid #e2e8f0; color: #475569;">${forta2}</td>
                    <td style="border: 1px solid #e2e8f0; background: #fffbeb; font-weight: bold; color: #b45309; font-size: 13px;">${notaC2}</td>
                    <td style="border: 1px solid #e2e8f0; background: #f1f5f9; font-weight: 800; color: #0f172a; font-size: 13px;">${finalNota}</td>
                </tr>`;
            });

            htmlEstructura += `
                        </tbody>
                    </table>
                </div>
            </div>`;

            visorBoletinContenedor.innerHTML = htmlEstructura;
        }



        // Renderizado automático inicial de la franja media de tarjetas al cargar la pantalla
        dibujarTarjetasTrayectoria();

        // Dejar disponible una función puente global para filtros cruzados si los requirieran sistemas externos
        window.filtrarHistorial = function(anio, categoria) {
            console.log(`[Puente Haspen] Comando de actualización recibido para Año: ${anio} | Cat: ${categoria}`);
            dibujarTarjetasTrayectoria();
        };

    } catch (error) {
        console.error("Fallo forense en la renderización del historial:", error);
        statusCarga.innerHTML = `<p class="text-sm text-rose-400 font-medium">⚠️ Error crítico al procesar la línea de tiempo escolar de la Aduana Local.</p>`;
    }
})();
